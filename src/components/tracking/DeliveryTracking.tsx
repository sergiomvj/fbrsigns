import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Search, 
  Package, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface TrackingData {
  code: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

const carrierConfig: Record<string, { name: string; logo: string; trackingUrl: string }> = {
  usps: {
    name: "USPS",
    logo: "📮",
    trackingUrl: "https://tools.usps.com/go/TrackConfirmAction",
  },
  ups: {
    name: "UPS",
    logo: "📦",
    trackingUrl: "https://www.ups.com/track",
  },
  fedex: {
    name: "FedEx",
    logo: "✈️",
    trackingUrl: "https://www.fedex.com/apps/fedextrack",
  },
  dhl: {
    name: "DHL",
    logo: "🌍",
    trackingUrl: "https://www.dhl.com/en/express/tracking.html",
  },
  correios: {
    name: "Correios",
    logo: "📮",
    trackingUrl: "https://rastreamento.correios.com.br",
  },
};

const statusSteps = [
  { key: "ordered", label: "Pedido Realizado", icon: Package },
  { key: "processing", label: "Em Processamento", icon: Clock },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "in_transit", label: "Em Trânsito", icon: MapPin },
  { key: "delivered", label: "Entregue", icon: CheckCircle },
];

export function DeliveryTracking() {
  const [trackingCode, setTrackingCode] = useState("");
  const [carrier, setCarrier] = useState("usps");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Simulação de busca - em produção, integrar com API de rastreamento
      // Ex: AfterShip, TrackingMore, ou API direta das transportadoras
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock de resposta
      const mockData: TrackingData = {
        code: trackingCode,
        carrier: carrier,
        status: "in_transit",
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            status: "ordered",
            location: "Miami, FL",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pedido recebido",
          },
          {
            status: "processing",
            location: "Miami, FL",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pedido em processamento",
          },
          {
            status: "shipped",
            location: "Miami, FL",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pedido enviado",
          },
          {
            status: "in_transit",
            location: "Atlanta, GA",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Em trânsito para destino",
          },
        ],
      };

      setTrackingData(mockData);
    } catch (err) {
      setError("Não foi possível rastrear o pedido. Verifique o código e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = (status: string) => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Rastrear Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o código de rastreamento"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="text-lg"
              />
            </div>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              {Object.entries(carrierConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.logo} {config.name}
                </option>
              ))}
            </select>
            <Button 
              onClick={handleTrack} 
              disabled={loading || !trackingCode.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rastrear
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {trackingData && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-lg">
                  {carrierConfig[trackingData.carrier]?.logo} {" "}
                  {carrierConfig[trackingData.carrier]?.name}
                </CardTitle>
                <p className="text-2xl font-mono font-bold mt-1">
                  {trackingData.code}
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Em Trânsito
                </Badge>
                {trackingData.estimatedDelivery && (
                  <p className="text-sm text-slate-500 mt-1">
                    Entrega prevista: {" "}
                    {format(new Date(trackingData.estimatedDelivery), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Progress Steps */}
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const currentStep = getCurrentStep(trackingData.status);
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center ${
                        isCompleted ? "text-primary" : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white ${
                          isCompleted
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 text-center max-w-[80px]">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Histórico de Eventos</h3>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white" />
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {statusSteps.find(s => s.key === event.status)?.label || event.status}
                          </p>
                          <p className="text-sm text-slate-500">{event.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            📍 {event.location}
                          </p>
                        </div>
                        <time className="text-xs text-slate-400 whitespace-nowrap">
                          {format(new Date(event.timestamp), "dd/MM HH:mm", {
                            locale: ptBR,
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Link */}
            <div className="mt-6 pt-6 border-t">
              <a
                href={carrierConfig[trackingData.carrier]?.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                Ver no site da transportadora
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-medium mb-1">Informações importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>O rastreamento pode levar até 24h para aparecer após o envio</li>
                <li>Atualizações de status ocorrem conforme a transportadora</li>
                <li>Para mais detalhes, acesse o site da transportadora</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
