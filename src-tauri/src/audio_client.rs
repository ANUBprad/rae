use std::sync::{Arc, Mutex};
use std::time::Duration;
use futures_util::{SinkExt, StreamExt};
use tokio::time::interval;
use tokio_tungstenite::connect_async;
use tungstenite::protocol::Message;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use serde_json::json;

fn float_to_pcm16(input: &[f32]) -> Vec<u8> {
    let mut out = Vec::with_capacity(input.len() * 2);
    for &sample in input {
        let clamped = sample.clamp(-1.0, 1.0);
        let s = if clamped < 0.0 {
            (clamped * 0x8000 as f32) as i16
        } else {
            (clamped * 0x7FFF as f32) as i16
        };
        out.extend_from_slice(&s.to_le_bytes());
    }
    out
}

pub async fn run_audio_client() {
    let url = "ws://localhost:8000/ws/realtime";
    let (ws_stream, _) = connect_async(url).await.expect("Failed to connect WS");
    println!("✅ WebSocket connected to {}", url);

    let (mut write, mut read) = ws_stream.split();
    let buffer: Arc<Mutex<Vec<f32>>> = Arc::new(Mutex::new(Vec::new()));

    // Capture system audio
    let host = cpal::default_host();
    let device = host.default_output_device().expect("No output device");
    let config = device.default_output_config().unwrap();

    let buffer_clone = buffer.clone();
    let stream = match config.sample_format() {
        cpal::SampleFormat::F32 => device.build_input_stream(
            &config.into(),
            move |data: &[f32], _| {
                buffer_clone.lock().unwrap().extend_from_slice(data);
            },
            move |err| eprintln!("Stream error: {:?}", err),
            None,
        ),
        _ => panic!("Unsupported format"),
    }.unwrap();

    stream.play().unwrap();

    // Task: send audio every 200ms
    let buffer_clone = buffer.clone();
    let mut send_interval = interval(Duration::from_millis(200));
    tokio::spawn(async move {
        loop {
            send_interval.tick().await;
            let mut buf = buffer_clone.lock().unwrap();
            if buf.is_empty() { continue; }

            let pcm = float_to_pcm16(&buf);
            let base64_audio = base64::encode(&pcm);

            let msg = json!({ "audio": base64_audio });
            if write.send(Message::Text(msg.to_string())).await.is_err() {
                break;
            }
            buf.clear();
        }
    });

    // Task: read messages from backend
    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(txt)) => {
                if let Ok(data) = serde_json::from_str::<serde_json::Value>(&txt) {
                    match data["type"].as_str() {
                        Some("response.text.delta") => {
                            println!("📝 Delta: {}", data["delta"]);
                        }
                        Some("response.text.done") => {
                            println!("✅ Final: {}", data["text"]);
                        }
                        Some("error") => {
                            eprintln!("❌ Error: {}", data["error"]);
                        }
                        _ => {}
                    }
                }
            }
            Ok(_) => {}
            Err(e) => {
                eprintln!("WS Error: {}", e);
                break;
            }
        }
    }
}
