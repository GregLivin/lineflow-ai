'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };

type ModelPart = {
  id: string;
  model: string;
  material_type: 'Boom' | 'Hood';
  part_name: string;
  part_number: string | null;
  quantity: number;
  location: string | null;
  active: boolean;
};

const starterModels = ['600S', '800S', '1200SJP', '1500SJ'];
const locationSuggestions = ['Soccer Field', 'Hotdog', 'Triangle', 'Racks', 'Fence Line', 'Line 1', 'Line 2', 'Line 3'];

export default function ModelPartsSetup({ user }: { user: DemoUser }) {
  const isTristen = user.username === 'tristen';
  const [parts, setParts] = useState<ModelPart[]>([]);
  const [selectedModel, setSelectedModel] = useState('1200SJP');
  const [materialType, setMaterialType] = useState<'Boom' | 'Hood'>(isTristen ? 'Hood' : 'Boom');
  const [newModel, setNewModel] = useState('');
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const canManage = ['tammy', 'chance', 'debbie', 'jose', 'greg', 'tristen'].includes(user.username);

  async function loadParts() {
    let query = supabase
      .from('model_parts')
      .select('id, model, material_type, part_name, part_number, quantity, location, active')
      .order('model')
      .order('part_name');

    // Tristen is the hood material handler. Do not load boom material into his view.
    if (isTristen) query = query.eq('material_type', 'Hood');

    const { data, error } = await query;

    if (error) setMessage('Unable to load model parts.');
    else setParts((data ?? []) as ModelPart[]);
    setLoading(false);
  }

  useEffect(() => {
    if (isTristen) setMaterialType('Hood');
    loadParts();
    const channel = supabase
      .channel(`lineflow-model-parts-${user.username}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'model_parts' }, () => loadParts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.username]);

  const modelOptions = useMemo(() => {
    const scopedParts = isTristen ? parts.filter(part => part.material_type === 'Hood') : parts;
    return Array.from(new Set([...starterModels, ...scopedParts.map(part => part.model)])).sort();
  }, [parts, isTristen]);

  const visibleParts = useMemo(
    () => parts.filter(part => part.model === selectedModel && part.material_type === materialType),
    [parts, selectedModel, materialType]
  );

  async function addPart(event: FormEvent) {
    event.preventDefault();
    if (!canManage || !partName.trim()) return;

    const effectiveMaterialType: 'Boom' | 'Hood' = isTristen ? 'Hood' : materialType;
    const model = (newModel.trim() || selectedModel).toUpperCase();
    const { error } = await supabase.from('model_parts').insert({
      model,
      material_type: effectiveMaterialType,
      part_name: partName.trim(),
      part_number: partNumber.trim() || null,
      quantity,
      location: location.trim() || null,
      active: true,
    });

    if (error) {
      setMessage('Part could not be added.');
      return;
    }

    setSelectedModel(model);
    setNewModel('');
    setPartName('');
    setPartNumber('');
    setQuantity(1);
    setLocation('');
    setMessage(`${partName.trim()} added to ${model}.`);
    await loadParts();
  }

  function updateLocal(id: string, field: keyof ModelPart, value: string | number | boolean) {
    setParts(current => current.map(part => part.id === id ? { ...part, [field]: value } as ModelPart : part));
  }

  async function savePart(part: ModelPart) {
    if (!canManage) return;
    if (isTristen && part.material_type !== 'Hood') return;

    setSavingId(part.id);
    const { error } = await supabase
      .from('model_parts')
      .update({
        model: part.model.trim().toUpperCase(),
        material_type: isTristen ? 'Hood' : part.material_type,
        part_name: part.part_name.trim(),
        part_number: part.part_number?.trim() || null,
        quantity: Math.max(1, Number(part.quantity) || 1),
        location: part.location?.trim() || null,
        active: part.active,
      })
      .eq('id', part.id);

    setSavingId(null);
    setMessage(error ? 'Part could not be saved.' : `${part.part_name} saved.`);
    if (!error) await loadParts();
  }

  async function deletePart(part: ModelPart) {
    if (!canManage) return;
    if (isTristen && part.material_type !== 'Hood') return;

    const { error } = await supabase.from('model_parts').delete().eq('id', part.id);
    setMessage(error ? 'Part could not be removed.' : `${part.part_name} removed.`);
    if (!error) await loadParts();
  }

  if (!canManage) return null;

  return (
    <section className="sectionBlock modelPartsSetup">
      <div className="requestFlowHeader">
        <div>
          <p className="eyebrow">Material Master Setup</p>
          <h2>{isTristen ? 'Hood Models, Part Numbers & Locations' : 'Models, Part Numbers & Locations'}</h2>
          <p className="dashboardRole">
            {isTristen
              ? 'Manage hood material only. Boom material is hidden from this account.'
              : 'Configure what parts each model requires. Line users only select the model; handlers receive the detailed parts list automatically.'}
          </p>
        </div>
      </div>

      {message && <p className="requestMessage">{message}</p>}

      <div className="modelSetupFilters">
        <label>Model
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            {modelOptions.map(model => <option key={model}>{model}</option>)}
          </select>
        </label>
        <label>Material Type
          {isTristen ? (
            <select value="Hood" disabled><option>Hood</option></select>
          ) : (
            <select value={materialType} onChange={e => setMaterialType(e.target.value as 'Boom' | 'Hood')}>
              <option>Boom</option>
              <option>Hood</option>
            </select>
          )}
        </label>
      </div>

      <div className="modelPartsTableWrap">
        <table className="modelPartsTable">
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Part Number</th>
              <th>Qty / Machine</th>
              <th>Location</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading model parts...</td></tr>
            ) : visibleParts.length === 0 ? (
              <tr><td colSpan={6}>No {materialType.toLowerCase()} parts configured for {selectedModel} yet.</td></tr>
            ) : visibleParts.map(part => (
              <tr key={part.id}>
                <td><input value={part.part_name} onChange={e => updateLocal(part.id, 'part_name', e.target.value)} /></td>
                <td><input value={part.part_number ?? ''} onChange={e => updateLocal(part.id, 'part_number', e.target.value)} placeholder="Part number" /></td>
                <td><input type="number" min="1" value={part.quantity} onChange={e => updateLocal(part.id, 'quantity', Math.max(1, Number(e.target.value) || 1))} /></td>
                <td><input list="lineflow-location-options" value={part.location ?? ''} onChange={e => updateLocal(part.id, 'location', e.target.value)} placeholder="Storage location" /></td>
                <td><input type="checkbox" checked={part.active} onChange={e => updateLocal(part.id, 'active', e.target.checked)} /></td>
                <td className="modelPartActions">
                  <button className="secondaryButton" onClick={() => savePart(part)} disabled={savingId === part.id}>{savingId === part.id ? 'Saving...' : 'Save'}</button>
                  <button className="removeRowButton" onClick={() => deletePart(part)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <datalist id="lineflow-location-options">
        {locationSuggestions.map(item => <option value={item} key={item} />)}
      </datalist>

      <form className="addModelPartForm" onSubmit={addPart}>
        <div><p className="eyebrow">Add Part</p><h3>{isTristen ? 'Add another hood part' : 'Add another required part'}</h3></div>
        <div className="requestFormGrid">
          <label>Model<input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder={`Leave blank for ${selectedModel}`} /></label>
          <label>Part Name<input required value={partName} onChange={e => setPartName(e.target.value)} placeholder={isTristen ? 'Example: Hood Assembly' : 'Example: Base Boom'} /></label>
          <label>Part Number<input value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="Part number" /></label>
          <label>Qty per Machine<input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))} /></label>
          <label>Location<input list="lineflow-location-options" value={location} onChange={e => setLocation(e.target.value)} placeholder="Storage location" /></label>
        </div>
        <button className="primaryButton" type="submit">{isTristen ? 'Add Hood Part to Model' : 'Add Part to Model'}</button>
      </form>
    </section>
  );
}
