// import Image from "next/image";
// import Link from "next/link";
import Button from "@mui/material/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to AI Teaching Tools.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Please log in below to get started.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button
            // component={NextLink}
            href="/login"
            variant="contained"
            className="h-12 w-full md:w-[158px]"
          >
            Login
          </Button>

          <Button
            // component={NextLink}
            href="/register"
            variant="outlined"
            className="h-12 w-full md:w-[158px]"
          >
            Register
          </Button>
        </div>
      </main>
    </div>
  );
}
