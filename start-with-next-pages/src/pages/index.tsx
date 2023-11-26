import dynamic from 'next/dynamic';

export const Canvas = dynamic(
  () => import('@/components/Canvas').then((mod) => mod.Canvas),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

export default function Home() {
  return (
    <main className={`min-h-screen`}>
      <Canvas />
    </main>
  );
}
