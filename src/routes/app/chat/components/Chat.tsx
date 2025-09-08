import { ArrowElbowDownLeftIcon } from "@phosphor-icons/react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Textarea from "@/components/ui/Textarea";

const Chat = ({ name }: { name: string }) => {
  const [message, setMessage] = useState("");
  const [init, setInit] = useState(false);
  const handleSend = () => {
    setInit(true);
  };
  return (
    <div className="absolute pointer-events-none size-full flex flex-col gap-4 items-center justify-center left-0 top-0 z-40 text-foreground">
      <motion.div
        initial={{ bottom: "30%", opacity: 0 }}
        animate={{ bottom: init ? "0%" : "40%", opacity: 1 }}
        className="flex flex-col absolute w-full  p-2 gap-4 justify-center items-center"
      >
        <motion.div animate={{ opacity: init ? 0 : 1 }} className="text-3xl text-zinc-200 font-semibold">
          Welcome Back, {name.split(" ")[0]}
        </motion.div>
        <motion.div
          initial={{ width: "70%", height: "100px" }}
          animate={{ width: init ? "100%" : "70%", height: init ? "120px" : "100px" }}
          className=" pointer-events-auto flex gap-2 relative"
        >
          <textarea
          
        //   rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here"
            className="dark:bg-zinc-900/50 resize-none w-full text-sm min-h-full rounded-lg  transition-colors duration-100 px-4 py-3 outline-none dark:focus:border-zinc-800  dark:border-zinc-900 "
          />
          <button onClick={() => handleSend()} className="rounded-lg absolute z-40 right-0 bottom-0 h-[40px] aspect-square shrink-0 border-2 transition-colors duration-100 dark:hover:border-surface/20 dark:border-zinc-900 m-2 dark:text-zinc-400 hover:dark:text-surface hover:dark:bg-surface/10 dark:bg-zinc-900 flex items-center justify-center">
            <ArrowElbowDownLeftIcon weight="bold" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Chat;
