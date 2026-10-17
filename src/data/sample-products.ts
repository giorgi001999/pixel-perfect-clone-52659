// SAMPLE DATA — illustrative only. Compatibility lists are limited to what is recorded here.
import type { Product } from "@/lib/catalog-types";

export const sampleProducts: Product[] = [
  {
    id: "p1", sku: "BRK-TY-0451", name: "Front Brake Pad Set", brand: "Brembo", category: "Brakes",
    oemNumber: "04465-33471", priceGel: 145, condition: "new_aftermarket", images: [], stock: "in_stock", featured: true,
    description: "Low-dust ceramic front brake pads with wear indicators.",
    compatibility: [{ make: "Toyota", model: "Camry", startYear: 2012, endYear: 2017 }],
  },
  {
    id: "p2", sku: "FLT-TY-0090", name: "Oil Filter", brand: "Toyota", category: "Filters",
    oemNumber: "04152-YZZA1", priceGel: 28, condition: "new_oem", images: [], stock: "in_stock", featured: true,
    description: "Genuine Toyota cartridge oil filter element.",
    compatibility: [
      { make: "Toyota", model: "Camry", startYear: 2012, endYear: 2024 },
      { make: "Toyota", model: "RAV4", startYear: 2013, endYear: 2024 },
    ],
  },
  {
    id: "p3", sku: "ENG-TY-1120", name: "Hybrid Inverter Coolant Pump", brand: "Aisin", category: "Engine",
    oemNumber: "G9020-47031", priceGel: 390, condition: "refurbished", images: [], stock: "low_stock", featured: true,
    description: "Refurbished electric water pump for the hybrid inverter cooling loop. Tested before shipping.",
    compatibility: [{ make: "Toyota", model: "Prius", startYear: 2010, endYear: 2015 }],
  },
  {
    id: "p4", sku: "LGT-MB-2201", name: "Left Headlight Assembly", brand: "Mercedes-Benz", category: "Lighting",
    oemNumber: "A2128201539", priceGel: 1250, condition: "used_oem", images: [], stock: "in_stock", featured: true,
    description: "Used genuine bi-xenon headlight, minor surface scratches, all mounting tabs intact.",
    compatibility: [{ make: "Mercedes-Benz", model: "E-Class (W212)", startYear: 2009, endYear: 2013 }],
  },
  {
    id: "p5", sku: "SUS-MB-0310", name: "Front Lower Control Arm", brand: "Lemförder", category: "Suspension",
    oemNumber: "A2043304311", priceGel: 210, condition: "new_aftermarket", images: [], stock: "in_stock",
    description: "Front lower control arm with pre-installed bushing.",
    compatibility: [{ make: "Mercedes-Benz", model: "C-Class (W204)", startYear: 2007, endYear: 2014 }],
  },
  {
    id: "p6", sku: "FLT-BM-0544", name: "Cabin Air Filter (Activated Carbon)", brand: "Mann-Filter", category: "Filters",
    oemNumber: "64119237555", priceGel: 55, condition: "new_aftermarket", images: [], stock: "in_stock", featured: true,
    description: "Activated carbon cabin filter, set of two.",
    compatibility: [{ make: "BMW", model: "3 Series (F30)", startYear: 2012, endYear: 2019 }],
  },
  {
    id: "p7", sku: "ELC-HY-0077", name: "Alternator 120A", brand: "Hyundai Mobis", category: "Electrical",
    oemNumber: "37300-2E100", priceGel: 480, condition: "refurbished", images: [], stock: "out_of_stock",
    description: "Remanufactured alternator, bench tested.",
    compatibility: [{ make: "Hyundai", model: "Elantra", startYear: 2014, endYear: 2016 }],
  },
  {
    id: "p8", sku: "BRK-FD-0612", name: "Rear Brake Disc", brand: "TRW", category: "Brakes",
    oemNumber: "DG9Z-2C026-A", priceGel: 120, condition: "new_aftermarket", images: [], stock: "low_stock",
    description: "Coated rear brake disc, sold individually.",
    compatibility: [{ make: "Ford", model: "Fusion", startYear: 2013, endYear: 2020 }],
  },
];
