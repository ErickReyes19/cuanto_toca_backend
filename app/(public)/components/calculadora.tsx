"use client";

import { Plane, Plus, Save, ShoppingCart, Trash2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { ListaTransferencias, TablaSaldos } from "@/components/resultado-liquidacion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_MONEDA, RUTAS } from "@/lib/i18n";
import { useIdioma } from "@/lib/i18n/cliente";
import { etiquetaMoneda } from "@/lib/i18n/monedas";
import { simplificarDeudas } from "@/lib/split/liquidacion";
import { MONEDAS, aUnidadMenor, formatearMonto } from "@/lib/split/moneda";
import { repartirGasto } from "@/lib/split/reparto";
import { calcularSaldos, totalGastado } from "@/lib/split/saldos";
import { escribirLocal, useAlmacenamientoLocal } from "@/hooks/use-almacenamiento-local";
import { useMonedaSugerida } from "@/hooks/use-moneda-sugerida";
import type { GastoCalculo } from "@/lib/split/tipos";
import {
  SelectorPagadores,
  resolverPagadores,
  type Pagador,
} from "@/components/grupos/selector-pagadores";
import { validarPagadores } from "@/lib/split/reparto";
import { enviarConEnter } from "@/lib/formulario";

export const CLAVE_BORRADOR = "cuanto-toca:grupo-local";

export type ParticipanteLocal = { id: string; nombre: string };

export type GastoLocal = {
  id: string;
  descripcion: string;
  montoCentavos: number;
  /** Quiénes pusieron el dinero y cuánto. Puede ser más de uno. */
  pagadores: Pagador[];
  /** Entre quiénes se divide (partes iguales) */
  participanteIds: string[];
};

/** VIAJE_REUNION reparte por gasto; DESPENSA_FAMILIAR piensa en productos. */
export type TipoGrupoLocal = "VIAJE_REUNION" | "DESPENSA_FAMILIAR";

export type GrupoLocal = {
  nombre: string;
  moneda: string;
  tipo: TipoGrupoLocal;
  participantes: ParticipanteLocal[];
  gastos: GastoLocal[];
};

const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ?? `tmp-${Math.random().toString(36).slice(2)}`;

function grupoVacio(moneda: string, tipo: TipoGrupoLocal): GrupoLocal {
  return { nombre: "", moneda, tipo, participantes: [], gastos: [] };
}

/**
 * @param tipoInicial Con qué tipo arranca si todavía no hay borrador. Las
 * páginas por caso de uso la montan ya en el modo que corresponde; un borrador
 * guardado siempre manda sobre esto, para no pisarle el trabajo a nadie.
 */
export function Calculadora({
  tipoInicial = "VIAJE_REUNION",
}: {
  tipoInicial?: TipoGrupoLocal;
} = {}) {
  const { idioma, t } = useIdioma();
  const localeUi = LOCALE_MONEDA[idioma];

  // El borrador vive en localStorage, no en estado de React: así sobrevive
  // recargas y no hace falta ningún efecto de sincronización.
  const crudo = useAlmacenamientoLocal(CLAVE_BORRADOR);
  const monedaLocal = useMonedaSugerida();

  /** Las dos formas de usar la app. Se elige antes de anotar nada. */
  const tiposGrupo = [
    {
      valor: "VIAJE_REUNION" as const,
      titulo: t.calculadora.tipoViaje,
      detalle: t.calculadora.tipoViajeDetalle,
      Icono: Plane,
    },
    {
      valor: "DESPENSA_FAMILIAR" as const,
      titulo: t.calculadora.tipoDespensa,
      detalle: t.calculadora.tipoDespensaDetalle,
      Icono: ShoppingCart,
    },
  ];

  /** Base UI muestra el valor crudo si no se le pasa el mapa de etiquetas. */
  const etiquetasMoneda = React.useMemo(
    () => Object.fromEntries(MONEDAS.map((m) => [m.codigo, etiquetaMoneda(m.codigo, idioma)])),
    [idioma]
  );

  const grupo = React.useMemo<GrupoLocal>(() => {
    if (crudo) {
      try {
        const guardado = JSON.parse(crudo) as GrupoLocal;
        if (Array.isArray(guardado?.participantes) && Array.isArray(guardado?.gastos)) {
          // Un borrador sin nada anotado no debe imponer su tipo sobre el de la
          // página: si entras por "dividir la despensa", esperas ver despensa.
          // En cuanto hay datos reales, el borrador manda y no se toca.
          const vacio = guardado.participantes.length === 0 && guardado.gastos.length === 0;
          return vacio ? { ...guardado, tipo: tipoInicial } : guardado;
        }
      } catch {
        // borrador corrupto: se empieza limpio
      }
    }
    return grupoVacio(monedaLocal, tipoInicial);
  }, [crudo, monedaLocal, tipoInicial]);

  const setGrupo = React.useCallback(
    (actualizar: (actual: GrupoLocal) => GrupoLocal) => {
      escribirLocal(CLAVE_BORRADOR, JSON.stringify(actualizar(grupo)));
    },
    [grupo]
  );

  const { participantes, gastos, moneda } = grupo;

  const gastosCalculo = React.useMemo<GastoCalculo[]>(() => {
    const idsValidos = new Set(participantes.map((p) => p.id));

    return gastos.flatMap((gasto) => {
      const entre = gasto.participanteIds.filter((id) => idsValidos.has(id));
      const pagadores = (gasto.pagadores ?? []).filter((x) => idsValidos.has(x.participanteId));
      if (pagadores.length === 0 || entre.length === 0) return [];

      const resultado = repartirGasto({
        montoCentavos: gasto.montoCentavos,
        tipoReparto: "IGUAL",
        entradas: entre.map((id) => ({ participanteId: id })),
      });
      if (!resultado.ok) return [];

      return [
        {
          id: gasto.id,
          montoCentavos: gasto.montoCentavos,
          pagadores,
          reparto: resultado.lineas,
        },
      ];
    });
  }, [gastos, participantes]);

  const saldos = React.useMemo(
    () => calcularSaldos(participantes.map((p) => p.id), gastosCalculo),
    [participantes, gastosCalculo]
  );
  const transferencias = React.useMemo(() => simplificarDeudas(saldos), [saldos]);
  const total = totalGastado(gastosCalculo);

  function agregarParticipante(nombre: string) {
    const limpio = nombre.trim();
    if (!limpio) return;
    if (participantes.length >= 50) {
      toast.error(t.calculadora.maximoIntegrantes);
      return;
    }
    setGrupo((g) => ({
      ...g,
      participantes: [...g.participantes, { id: nuevoId(), nombre: limpio }],
    }));
  }

  function quitarParticipante(id: string) {
    setGrupo((g) => ({
      ...g,
      participantes: g.participantes.filter((p) => p.id !== id),
      // Se limpian las referencias para que ningún gasto quede huérfano.
      gastos: g.gastos
        // Si quien sale era el único que había puesto dinero, el gasto se va con él.
        .filter((gasto) => gasto.pagadores.some((x) => x.participanteId !== id))
        .map((gasto) => ({
          ...gasto,
          pagadores: gasto.pagadores.filter((x) => x.participanteId !== id),
          participanteIds: gasto.participanteIds.filter((pid) => pid !== id),
        })),
    }));
  }

  function agregarGasto(gasto: GastoLocal) {
    setGrupo((g) => ({ ...g, gastos: [gasto, ...g.gastos] }));
  }

  function quitarGasto(id: string) {
    setGrupo((g) => ({ ...g, gastos: g.gastos.filter((gasto) => gasto.id !== id) }));
  }

  function limpiarTodo() {
    setGrupo(() => grupoVacio(moneda, tipoInicial));
    toast.success(t.calculadora.calculoBorrado);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" /> {t.calculadora.pasoGrupo}
          </CardTitle>
          <CardDescription>{t.calculadora.pasoGrupoDetalle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* El tipo cambia cómo se piensa el gasto: por salida o por producto. */}
          <div className="grid gap-2 sm:grid-cols-2">
            {tiposGrupo.map((opcion) => {
              const activo = grupo.tipo === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => setGrupo((g) => ({ ...g, tipo: opcion.valor }))}
                  aria-pressed={activo}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    activo ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <opcion.Icono className="size-4" />
                    {opcion.titulo}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {opcion.detalle}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <Input
              placeholder={
                grupo.tipo === "DESPENSA_FAMILIAR"
                  ? t.calculadora.nombreDespensa
                  : t.calculadora.nombreViaje
              }
              value={grupo.nombre}
              onChange={(e) => setGrupo((g) => ({ ...g, nombre: e.target.value }))}
              maxLength={120}
            />
            <Select
              value={moneda}
              items={etiquetasMoneda}
              onValueChange={(valor) => setGrupo((g) => ({ ...g, moneda: valor ?? g.moneda }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.calculadora.moneda} />
              </SelectTrigger>
              <SelectContent>
                {MONEDAS.map((m) => (
                  <SelectItem key={m.codigo} value={m.codigo}>
                    {etiquetaMoneda(m.codigo, idioma)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormularioParticipante onAgregar={agregarParticipante} />

          {participantes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participantes.map((p) => (
                <Badge key={p.id} variant="secondary" className="gap-1.5 py-1.5 pr-1.5 pl-3">
                  {p.nombre}
                  <button
                    type="button"
                    onClick={() => quitarParticipante(p.id)}
                    aria-label={t.calculadora.quitarA(p.nombre)}
                    className="rounded-full p-0.5 hover:bg-foreground/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.calculadora.sinIntegrantes}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" /> {t.calculadora.pasoGastos}
          </CardTitle>
          <CardDescription>{t.calculadora.pasoGastosDetalle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {participantes.length < 2 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t.calculadora.faltanIntegrantes}
            </p>
          ) : (
            <FormularioGasto
              participantes={participantes}
              moneda={moneda}
              onAgregar={agregarGasto}
            />
          )}

          {gastos.length > 0 ? (
            <ul className="divide-y rounded-xl border">
              {gastos.map((gasto) => {
                const nombresPago = gasto.pagadores
                  .map((x) => participantes.find((p) => p.id === x.participanteId)?.nombre)
                  .filter((nombre): nombre is string => Boolean(nombre));
                return (
                  <li key={gasto.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{gasto.descripcion}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.calculadora.pagaron(nombresPago)} ·{" "}
                        {t.calculadora.entrePersonas(gasto.participanteIds.length)}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatearMonto(gasto.montoCentavos, moneda, localeUi)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => quitarGasto(gasto.id)}
                      aria-label={t.calculadora.eliminarGasto}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{t.calculadora.pasoResultado}</CardTitle>
              <CardDescription>
                {gastosCalculo.length > 0
                  ? t.calculadora.totalDelGrupo(formatearMonto(total, moneda, localeUi))
                  : t.calculadora.sinResultado}
              </CardDescription>
            </div>
            {gastos.length > 0 || participantes.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={limpiarTodo}>
                {t.calculadora.empezarDeNuevo}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gastosCalculo.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t.calculadora.resultadoVacio}
            </p>
          ) : (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {t.calculadora.saldos}
                </h3>
                <TablaSaldos participantes={participantes} saldos={saldos} moneda={moneda} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {t.calculadora.quienPagaAQuien(transferencias.length)}
                </h3>
                <ListaTransferencias
                  participantes={participantes}
                  transferencias={transferencias}
                  moneda={moneda}
                />
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{t.calculadora.guardarGrupo}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.calculadora.guardarGrupoDetalle}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  render={<Link href={RUTAS.registro[idioma]} />}
                  className="shrink-0"
                >
                  <Save className="size-4" /> {t.calculadora.guardarEInvitar}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FormularioParticipante({ onAgregar }: { onAgregar: (nombre: string) => void }) {
  const t = useIdioma().t;
  const [nombre, setNombre] = React.useState("");

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    onAgregar(nombre);
    setNombre("");
  }

  return (
    <form onSubmit={enviar} className="flex gap-2">
      <Input
        placeholder={t.calculadora.nombreIntegrante}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={enviarConEnter}
        maxLength={80}
      />
      <Button type="submit" variant="outline" disabled={!nombre.trim()}>
        <Plus className="size-4" /> {t.calculadora.agregar}
      </Button>
    </form>
  );
}

function FormularioGasto({
  participantes,
  moneda,
  onAgregar,
}: {
  participantes: ParticipanteLocal[];
  moneda: string;
  onAgregar: (gasto: GastoLocal) => void;
}) {
  const t = useIdioma().t;
  const [descripcion, setDescripcion] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [pagadores, setPagadores] = React.useState<Pagador[]>(
    participantes[0] ? [{ participanteId: participantes[0].id, montoCentavos: 0 }] : []
  );
  const [entre, setEntre] = React.useState<string[]>(() => participantes.map((p) => p.id));

  // Las selecciones se depuran durante el render en vez de con un efecto:
  // si alguien sale del grupo, deja de contar sin provocar otro render.
  const ids = participantes.map((p) => p.id);
  const entreValido = entre.filter((id) => ids.includes(id));
  const pagadoresValidos = pagadores.filter((x) => ids.includes(x.participanteId));
  const montoActual = aUnidadMenor(monto, moneda) ?? 0;

  function alternar(id: string) {
    setEntre((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
    );
  }

  function enviar(event: React.FormEvent) {
    event.preventDefault();

    const montoCentavos = aUnidadMenor(monto, moneda);
    if (montoCentavos === null || montoCentavos <= 0) {
      toast.error(t.calculadora.errorMonto);
      return;
    }
    if (!descripcion.trim()) {
      toast.error(t.calculadora.errorDescripcion);
      return;
    }
    const resueltos = resolverPagadores(pagadoresValidos, montoCentavos);
    const revision = validarPagadores(montoCentavos, resueltos);
    if (!revision.ok) {
      toast.error(t.calculadora.errorPagadores[revision.motivo] ?? revision.error);
      return;
    }
    if (entreValido.length === 0) {
      toast.error(t.calculadora.errorReparto);
      return;
    }

    onAgregar({
      id: nuevoId(),
      descripcion: descripcion.trim(),
      montoCentavos,
      pagadores: resueltos,
      participanteIds: entreValido,
    });

    setDescripcion("");
    setMonto("");
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-xl border bg-muted/30 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
        <Input
          placeholder={t.calculadora.queSeGasto}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          onKeyDown={enviarConEnter}
          maxLength={160}
        />
        <Input
          inputMode="decimal"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          onKeyDown={enviarConEnter}
          className="text-right tabular-nums"
        />
      </div>

      <SelectorPagadores
        participantes={participantes}
        moneda={moneda}
        totalCentavos={montoActual}
        pagadores={pagadoresValidos}
        onChange={setPagadores}
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          {t.calculadora.seDivideEntre(entreValido.length)}
        </label>
        <div className="flex flex-wrap gap-2">
          {participantes.map((p) => {
            const activo = entreValido.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => alternar(p.id)}
                aria-pressed={activo}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  activo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.nombre}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="size-4" /> {t.calculadora.agregarGasto}
      </Button>
    </form>
  );
}
