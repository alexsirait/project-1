import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function SendMessage() {
  const [inputValue, setInputValue] = useState(""); // Untuk menyimpan input pesan
  const [messageFromProject2, setMessageFromProject2] = useState(""); // Pesan dari Proyek 2

  // Mendengarkan perubahan pesan dari Firestore untuk Proyek 2
  useEffect(() => {
    const docRef = doc(db, "messages", "userMessage2");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessageFromProject2(docSnap.data().message); // Pesan dari Proyek 2
      }
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk mengirim pesan ke Firestore untuk Proyek 1
  const handleSubmit = async () => {
    if (inputValue.trim()) {
      const docRef = doc(db, "messages", "userMessage1");
      await setDoc(docRef, { message: inputValue }); // Mengirim pesan
      setInputValue(""); // Membersihkan input setelah mengirim
    }
  };

  return (
    <div>
  <h1>Project 1: Kirim Pesan</h1>
  
  {/* Input untuk memasukkan pesan */}
  <input
    type="text"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    placeholder="Masukkan pesan untuk Project 2"
    style={{
      marginBottom: "20px", // Memberikan jarak bawah pada input
      padding: "10px", // Memberikan padding pada input
      width: "100%", // Memperlebar input untuk mengisi lebar kontainer
      maxWidth: "400px", // Membatasi lebar maksimum input
      marginRight: "auto", // Mengatur input agar terletak di tengah
      marginLeft: "auto", // Mengatur input agar terletak di tengah
      display: "block", // Membuat input menjadi block untuk lebih lebar
    }}
  />

  {/* Tombol untuk mengirim pesan */}
  <button
    onClick={handleSubmit}
    style={{
      marginBottom: "30px", // Memberikan jarak bawah pada button
      padding: "10px 80px", // Memberikan padding pada button
      backgroundColor: "#4CAF50", // Memberikan warna latar belakang tombol
      color: "white", // Mengubah warna teks tombol
      border: "none", // Menghapus border tombol
      cursor: "pointer", // Menampilkan kursor pointer saat hover
      display: "block", // Membuat tombol menjadi block untuk lebih lebar
      marginLeft: "auto", // Mengatur tombol agar terletak di tengah
      marginRight: "auto", // Mengatur tombol agar terletak di tengah
    }}
  >
    Kirim ke Project 2
  </button>

  {/* Menampilkan pesan dari Project 2 */}
  <h2 style={{marginBottom: "20px"}}>Pesan dari Project 2:</h2>
  <p style={{ fontSize: "20px", color: "white" }}>
    {messageFromProject2 || "Belum ada pesan dari Project 2."}
  </p>
</div>

  );
}
