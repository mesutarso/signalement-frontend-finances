import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ImportButton() {
  return <Button variant="outline" nativeButton={false} render={<Link href="/imports" />}>Suivre les imports</Button>;
}
