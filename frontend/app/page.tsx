import Image from "next/image";

export default function Home() {
  return (
    <div className="p-10 bg-white min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-16 text-[#6B00BF] text-center">Visualización de reportes</h1>
      
      <Image 
        src="/gatito.png" 
        alt="gatito" 
        width={400} 
        height={400}
      />
    </div>
  );
}

