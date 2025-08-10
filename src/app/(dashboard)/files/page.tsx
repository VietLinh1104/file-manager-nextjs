"use client";
import {
  Form
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

export default function GeneratedForm() {
  const formSchema = z.object({ "text-0": z.string() });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "text-0": "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        className="space-y-8 @container"
      >
        <div className="grid grid-cols-12 gap-4">
          <div
            key="text-0"
            id="text-0"
            className=" col-span-12 @5xl:col-span-12 col-start-auto"
          >
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              <span className="text-xl text-muted-foreground">Document List</span>
            </h2>
          </div>
        </div>
      </form>
    </Form>
  );
}
