import { Product } from "@/types/product";

export const products: Product[] = [
  // Preenchedores
  {
    id: "ah-1",
    name: "Ácido Hialurônico Juvederm Ultra",
    description: "Preenchedor de alta densidade para volumização facial",
    price: 890.00,
    category: "preenchedores",
    image: "/placeholder.svg",
    badge: "bestseller"
  },
  {
    id: "ah-2",
    name: "Ácido Hialurônico Restylane",
    description: "Ideal para contorno labial e sulcos nasogenianos",
    price: 750.00,
    category: "preenchedores",
    image: "/placeholder.svg"
  },
  {
    id: "ah-3",
    name: "Ácido Hialurônico Belotero",
    description: "Textura suave para áreas delicadas",
    price: 680.00,
    category: "preenchedores",
    image: "/placeholder.svg",
    badge: "new"
  },
  {
    id: "ah-4",
    name: "Skinbooster Profhilo",
    description: "Bioestimulador e hidratante profundo",
    price: 1200.00,
    category: "preenchedores",
    image: "/placeholder.svg",
    badge: "bestseller"
  },
  
  // Toxinas
  {
    id: "tx-1",
    name: "Toxina Botulínica Botox",
    description: "100U - Padrão ouro para tratamentos estéticos",
    price: 650.00,
    category: "toxinas",
    image: "/placeholder.svg",
    badge: "bestseller"
  },
  {
    id: "tx-2",
    name: "Toxina Botulínica Dysport",
    description: "500U - Difusão controlada para resultados naturais",
    price: 580.00,
    category: "toxinas",
    image: "/placeholder.svg"
  },
  {
    id: "tx-3",
    name: "Toxina Botulínica Xeomin",
    description: "100U - Sem proteínas complexantes",
    price: 620.00,
    category: "toxinas",
    image: "/placeholder.svg",
    badge: "promotion"
  },
  
  // Fios
  {
    id: "fio-1",
    name: "Fios de PDO Lifting",
    description: "Pack com 10 fios espiculados 19G",
    price: 450.00,
    category: "fios",
    image: "/placeholder.svg"
  },
  {
    id: "fio-2",
    name: "Fios de PDO Mono",
    description: "Pack com 20 fios lisos para bioestímulo",
    price: 280.00,
    category: "fios",
    image: "/placeholder.svg",
    badge: "promotion"
  },
  {
    id: "fio-3",
    name: "Fios de PDO Espiral",
    description: "Pack com 10 fios para volumização",
    price: 350.00,
    category: "fios",
    image: "/placeholder.svg"
  },
  
  // Bioestimuladores
  {
    id: "bio-1",
    name: "Sculptra (PLLA)",
    description: "Bioestimulador de colágeno - 2 frascos",
    price: 2800.00,
    category: "bioestimuladores",
    image: "/placeholder.svg",
    badge: "bestseller"
  },
  {
    id: "bio-2",
    name: "Radiesse (CaHA)",
    description: "Preenchedor e bioestimulador 1.5ml",
    price: 1600.00,
    category: "bioestimuladores",
    image: "/placeholder.svg"
  },
  {
    id: "bio-3",
    name: "Ellansé M",
    description: "Bioestimulador de longa duração 1ml",
    price: 2200.00,
    category: "bioestimuladores",
    image: "/placeholder.svg",
    badge: "new"
  },
  
  // Insumos
  {
    id: "ac-1",
    name: "Cânulas 25G x 50mm",
    description: "Caixa com 20 unidades - ponta flexível",
    price: 120.00,
    category: "insumos",
    image: "/placeholder.svg"
  },
  {
    id: "ac-2",
    name: "Cânulas 27G x 40mm",
    description: "Caixa com 20 unidades - ultra finas",
    price: 130.00,
    category: "insumos",
    image: "/placeholder.svg"
  },
  {
    id: "ac-3",
    name: "Agulhas 30G x 13mm",
    description: "Caixa com 100 unidades",
    price: 45.00,
    category: "insumos",
    image: "/placeholder.svg"
  },
  {
    id: "ac-4",
    name: "Anestésico Lidocaína 2%",
    description: "Frasco 20ml com vasoconstritor",
    price: 35.00,
    category: "insumos",
    image: "/placeholder.svg"
  },
  {
    id: "ac-5",
    name: "Pomada Anestésica EMLA",
    description: "Bisnaga 30g - Lidocaína + Prilocaína",
    price: 85.00,
    category: "insumos",
    image: "/placeholder.svg"
  }
];

export const categoryLabels: Record<string, string> = {
  preenchedores: "Preenchedores",
  toxinas: "Toxina Botulínica",
  fios: "Fios de PDO",
  bioestimuladores: "Bioestimuladores",
  insumos: "Insumos"
};
