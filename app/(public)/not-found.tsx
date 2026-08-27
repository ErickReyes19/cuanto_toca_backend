import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";

export default async function NotFound() {
    const idioma = await getIdioma();
    const t = diccionario(idioma);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <FileQuestion className="h-32 w-32 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <h2 className="text-2xl font-semibold tracking-tight">{t.noEncontrado.titulo}</h2>
                <p className="text-muted-foreground">{t.noEncontrado.detalle}</p>
                <div className="pt-4">
                    <Button nativeButton={false} render={<Link href={RUTAS.inicio[idioma]} />}>
                        {t.noEncontrado.volver}
                    </Button>
                </div>
            </div>
        </div>
    );
}
