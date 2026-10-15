/**
 * Definisi Checklist Pre-Delivery Inspection (PDI)
 * Berdasarkan formulir standar New Machine Pre-Delivery Inspection.
 */

export const PDI_SECTIONS = [
  {
    id: 'oil_fluid',
    categoryName: 'Oil/Fluid levels and leakage check',
    description: 'Pemeriksaan ketinggian oli/fluida sistem & pencegahan kebocoran',
    items: [
      { id: 'oil_level', label: 'Oil level and leakage check' },
      { id: 'engine_cooling', label: 'Engine cooling and lubricating System' },
      { id: 'transmission', label: 'Transmission' },
      { id: 'swing_motor', label: 'Swing Motor' },
      { id: 'pump_gear_main', label: 'Pump (Gear,Main)' },
      { id: 'batteries', label: 'Batteries' },
      { id: 'cylinder_boom_arm_bucket', label: 'Cylinder - Boom ,Arm,Bucket' },
      { id: 'travel_device', label: 'Travel Device' },
      { id: 'idler_rollers', label: 'Idler ,upper and Lower Roller' },
      { id: 'cylinder_blade_ram_outrigger_steering', label: 'Cylinder-Blade,Ram,Outrigger,Steering' },
      { id: 'steering_pump', label: 'Steering Pump' },
      { id: 'hub_differentials', label: 'Hub and Differentials' },
      { id: 'air_brake_system', label: 'Air and Brake system' },
      { id: 'tire_screws_bolts', label: 'Check tire inflation pressure and check screw ,nuts and bolt for tightness' }
    ]
  },
  {
    id: 'maintenance',
    categoryName: 'Maintenance',
    description: 'Pemeriksaan tegangan fan belt, fungsi tuas operasi & lubrikasi pin',
    items: [
      { id: 'fan_drive_belt', label: 'Check fan drive belt tensions' },
      { id: 'operating_levers_func', label: 'Check operating levers function' },
      { id: 'lubricate_grease_pins', label: 'Lubricate all grease nipple point and front joint pins' },
      { id: 'clean_piston_rods', label: 'Clean the piston rods of all hydraulic Cylinder' }
    ]
  },
  {
    id: 'function_test',
    categoryName: 'FUNCTION TEST',
    description: 'Uji performa start engine, kelistrikan, monitor gauge & tuas kendali',
    items: [
      { 
        id: 'func_engine', 
        label: 'Engine : Starting behavior and performance.' 
      },
      { 
        id: 'func_electrical', 
        label: 'Electrical System : Wiring,lighting,alternator,batteries,starter,cold start,wippers and cab heater, air conditioner (electric fan),circuit breaker switch .' 
      },
      { 
        id: 'func_monitor', 
        label: 'Monitor System : Gauge and check and caution monitor group (all switch ,indiction and wiring lamp).' 
      },
      { 
        id: 'func_operating_levers_1', 
        label: 'Operating Levers : Swing and arm control lever lock,swing lock lever,boom and bucket control lever.' 
      },
      { 
        id: 'func_operating_levers_2', 
        label: 'Operating levers : Engine Control lever,travel levers and pedals.' 
      },
      { 
        id: 'func_operating_levers_3', 
        label: 'Operating levers : Fuel lever,blade control lever ,steer handle,acceleration pedal,and parking brake lever.' 
      }
    ]
  },
  {
    id: 'external',
    categoryName: 'EXTERNAL',
    description: 'Pemeriksaan fisik luar, kesesuaian kontrak & kelengkapan aksesoris/buku manual',
    items: [
      { id: 'ext_paint_welds', label: 'Paint work ,welded seams.' },
      { id: 'ext_order_items', label: 'Check items covered by the order /contract.' },
      { 
        id: 'ext_spare_parts_tools', 
        label: 'Initial spare parts and standard accessaries : Parts ,tool kit ,starter and door key,manuals (parts,hydraulic component, operation, maintenance), warranty service check book' 
      }
    ]
  }
];

// Total seluruh item checklist
export const TOTAL_PDI_ITEMS = PDI_SECTIONS.reduce((acc, sec) => acc + sec.items.length, 0); // 27 items

// Inisialisasi awal seluruh checklist: SEMUA FALSE (tidak otomatis terisi, wajib dicentang manual satu-satu)
export const getInitialPdiItems = () => {
  const items = {};
  PDI_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      items[item.id] = false;
    });
  });
  return items;
};
