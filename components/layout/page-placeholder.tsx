import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="inline-flex w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
          {eyebrow}
        </div>
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Data model ready", "UI route ready", "Module next"].map((item) => (
            <div
              key={item}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
