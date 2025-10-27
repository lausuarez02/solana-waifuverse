import { Suspense } from "react";
import ChatClient from "./ChatClient";
import styles from "./page.module.css";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Loading chat...</div>
      </div>
    }>
      <ChatClient />
    </Suspense>
  );
}
