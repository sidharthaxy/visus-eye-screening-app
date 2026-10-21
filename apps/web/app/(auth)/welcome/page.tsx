import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

export default function Welcome() {
  return (
    <main className="no-scrollbar flex h-full flex-col overflow-y-auto bg-pearl px-6 pb-10 pt-7">
      <div className="text-[20px] font-bold tracking-[-0.01em]">Visus</div>
      <div className="flex min-h-0 flex-1 flex-col justify-end pb-8">
        <div className="flex min-h-[180px] flex-1 items-center justify-center pb-5 pt-2">
          <Image src="/visus-eye.png" alt="Hand-drawn blue eye" width={960} height={717} priority className="h-full max-h-[250px] w-full max-w-[330px] object-contain" />
        </div>
        <h1 className="m-0 text-hero font-bold leading-[1.08] tracking-[-0.03em] text-balance">Quick eye checks, right on your phone.</h1>
        <p className="m-0 mt-4 max-w-[330px] text-body leading-normal text-muted text-pretty">
          Simple guided tests for sharpness, focus and colour, whenever you have five minutes.
        </p>
        <span className="mt-[22px] flex h-[34px] items-center gap-2 self-start rounded-full bg-pill px-3.5 text-[14px] font-semibold text-ink-soft">
          <Icon name="lock" size={16} strokeWidth={1.7} />
          Tests run on your phone.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Button href="/signup">Sign up</Button>
        <Button href="/login" variant="secondary">
          Log in
        </Button>
        <Button href="/home" variant="ghost" className="text-[16px]!">
          Continue as guest
        </Button>
      </div>

      <p className="m-0 mt-1.5 text-center text-[13px] leading-normal text-muted">
        By continuing you agree to our{" "}
        <Link href="/settings/about" className="font-semibold text-ink">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/settings/about" className="font-semibold text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
