import { SignUp } from "@clerk/remix";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export default function SignUpPage() {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <SignUp />
    </div>
  );
}
