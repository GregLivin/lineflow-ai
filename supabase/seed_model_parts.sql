-- LineFlow AI starter master data
-- Transcribed from Greg's photographed boom / push-tube reference sheets.
-- IMPORTANT: review against the controlled company reference before production use.
-- This seed only uses the fields currently supported by public.model_parts.
-- Color and power-track relationships should be added in a later schema migration.

insert into public.model_parts
  (model, material_type, part_name, part_number, quantity, location, active)
values
  ('660SJ','Boom','Base','0801396S',1,null,true),
  ('660SJ','Boom','Mid','0801524S',1,null,true),
  ('660SJ','Boom','Fly','1001157623',1,null,true),

  ('860SJ','Boom','New Base','1001155771S',1,null,true),
  ('860SJ','Boom','Mid','0801647S',1,null,true),
  ('860SJ','Boom','Fly','0801282S',1,null,true),
  ('860SJ','Boom','Upright','1001157180',1,null,true),
  ('860SJ','Boom','Links',null,1,null,true),

  ('1200S','Boom','Base','0801316S',1,null,true),
  ('1200S','Boom','Small Mid','0801317S',1,null,true),
  ('1200S','Boom','Big Mid','0801318S',1,null,true),
  ('1200S','Boom','Fly','0801319S',1,null,true),

  ('1350','Boom','Base','0801301S',1,null,true),
  ('1350','Boom','Small Mid','0801302S',1,null,true),
  ('1350','Boom','Big Mid','0801303S',1,null,true),
  ('1350','Boom','Fly','0801304S',1,null,true),

  ('1500','Boom','Base','1001117456S',1,null,true),
  ('1500','Boom','Small Mid','1001117457S',1,null,true),
  ('1500','Boom','Big Mid','1001117458S',1,null,true),
  ('1500','Boom','Fly','1001117459S',1,null,true),
  ('1500','Boom','Jib Base','1001119414',1,null,true),
  ('1500','Boom','Jib Fly','1001119413',1,null,true),

  ('600AJ','Boom','4 Hole Base','0801621S',1,null,true),
  ('600AJ','Boom','2 Hole Base','1001152249S',1,null,true),
  ('600AJ','Boom','Lower Base','0801622S',1,null,true),
  ('600AJ','Boom','4 Hole Fly','0801613S',1,null,true),
  ('600AJ','Boom','2 Hole Fly','1001156502S',1,null,true),
  ('600AJ','Boom','Lower Fly','0801637S',1,null,true),
  ('600AJ','Boom','Upright',null,1,null,true),

  ('800AJ','Boom','Upper Base','0801591S',1,null,true),
  ('800AJ','Boom','Upper Fly','0801573S',1,null,true),
  ('800AJ','Boom','Lower Base','0801594S',1,null,true),
  ('800AJ','Boom','Lower Fly','0801496S',1,null,true),
  ('800AJ','Boom','Upright','4845593',1,null,true),

  ('800A','Boom','Upper Base','0801591S',1,null,true),
  ('800A','Boom','Upper Fly','0801573S',1,null,true),
  ('800A','Boom','Lower Base','0801594S',1,null,true),
  ('800A','Boom','Lower Fly','0801496S',1,null,true),
  ('800A','Boom','Upright','4845593',1,null,true),

  ('800S','Boom','Base','1001155770S',1,null,true),
  ('800S','Boom','Mid','0801649S',1,null,true),
  ('800S','Boom','Fly','0801275S',1,null,true),
  ('800S','Boom','Upright','1001157180',1,null,true),

  ('600A','Boom','Push Tube 1','4844969BED',1,null,true),
  ('600A','Boom','Push Tube 2','4844792S',1,null,true),
  ('600AJ','Boom','Push Tube 1','4844978BED / 1001161417S',1,null,true),
  ('600AJ','Boom','Push Tube 2','4844979S',1,null,true),
  ('600S','Boom','Push Tube 1','4845671S',1,null,true),
  ('600S','Boom','Push Tube 2','4845819S',1,null,true),
  ('660SJ','Boom','Push Tube 1','4845671S',1,null,true),
  ('660SJ','Boom','Push Tube 2','4845819S',1,null,true),
  ('600SJ','Boom','Push Tube 1','4846391BED',1,null,true),
  ('600SJ','Boom','Push Tube 2','4846392BED',1,null,true),
  ('1200SJP','Boom','Push Tube 1','1180369BED',1,null,true),
  ('1200SJP','Boom','Push Tube 2','1180370BED',1,null,true),
  ('1350SJP','Boom','Push Tube 1','1180362BED',1,null,true),
  ('1350SJP','Boom','Push Tube 2','1180363BED',1,null,true),
  ('800A','Boom','Push Tube 1','4845701BED',1,null,true),
  ('800A','Boom','Push Tube 2','4845702BED',1,null,true),
  ('800AJ','Boom','Push Tube 1','4845729BED',1,null,true),
  ('800AJ','Boom','Push Tube 2','4845730BED',1,null,true),
  ('800S','Boom','Push Tube 1','4846554BED / 1001156443S',1,null,true),
  ('800S','Boom','Push Tube 2','4846558S',1,null,true),
  ('800S','Boom','Push Tube 3','4846553S',1,null,true),
  ('860SJ','Boom','Push Tube 1','4846555S / 1001156914S',1,null,true),
  ('860SJ','Boom','Push Tube 2','4846558S',1,null,true),
  ('860SJ','Boom','Push Tube 3','4846553S',1,null,true)
on conflict do nothing;

-- REVIEW BEFORE PRODUCTION:
-- 600A Push Tube 2 (4844792S) should be checked against the original controlled sheet.
-- Rows with null part_number were visible on the sheet but did not show a readable part number.
