import { Instagram, MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export function Footer() {
  const { settings } = useAdmin();

  // Format phone for display: 5511999999999 -> (11) 99999-9999
  const formatPhoneDisplay = (number: string) => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 4) return digits;
    // Remove country code (55) if present
    const phone = digits.startsWith("55") ? digits.slice(2) : digits;
    if (phone.length <= 2) return `(${phone}`;
    if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
  };

  return (
    <footer id="contato" className="bg-primary text-primary-foreground">
      {/* About Section */}
      <section id="sobre" className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sobre a <span className="text-secondary">Help HOF</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Somos especializados em fornecer produtos de alta qualidade para profissionais
              de Harmonização Orofacial. Nossa missão é garantir que profissionais da área da
              saúde tenham acesso aos melhores produtos do mercado com agilidade e segurança.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold mb-4">
              Help<span className="text-secondary">HOF</span>
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Produtos premium para Harmonização Orofacial com qualidade e procedência garantidas.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-whatsapp hover:text-whatsapp-foreground transition-all"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Úteis</h4>
            <ul className="space-y-3">
              <li>
                <a href="#produtos" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  Produtos
                </a>
              </li>
              <li>
                <a href="#sobre" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contato" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="h-4 w-4 text-secondary" />
                <span>{formatPhoneDisplay(settings.whatsappNumber)}</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="h-4 w-4 text-secondary" />
                <span>contato@helphof.com.br</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-secondary mt-1" />
                <span>Belo Horizonte, MG</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 Help HOF. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Produtos exclusivos para profissionais habilitados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
