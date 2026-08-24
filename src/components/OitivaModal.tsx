import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Video, 
  AlertCircle, 
  Save, 
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { Oitiva, HearingStatus, HearingRole, ProcedureType, HearingModality } from '../types/oitiva';
import { formatCPF, formatPhone } from '../utils/formatters';

interface OitivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Oitiva, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Oitiva | null;
  defaultDate?: string;
}

export const OitivaModal: React.FC<OitivaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate
}) => {
  const [activeTab, setActiveTab] = useState<'depoente' | 'procedimento' | 'agendamento'>('depoente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form states
  const [personName, setPersonName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:30');
  const [procedureNumber, setProcedureNumber] = useState('');
  const [procedureType, setProcedureType] = useState<string>('Inquérito Policial (IP)');
  const [role, setRole] = useState<HearingRole>('Testemunha');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Maracanaú/CE');
  const [officerName, setOfficerName] = useState('');
  const [clerkName, setClerkName] = useState('');
  const [modality, setModality] = useState<HearingModality>('Presencial');
  const [locationOrLink, setLocationOrLink] = useState('Sala de Oitivas 01');
  const [status, setStatus] = useState<HearingStatus>('Agendada');
  const [notes, setNotes] = useState('');
  const [intimationSent, setIntimationSent] = useState(false);

  // Reset or populate on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPersonName(initialData.personName || '');
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setTime(initialData.time || '09:30');
        setProcedureNumber(initialData.procedureNumber || '');
        setProcedureType(initialData.procedureType || 'Inquérito Policial (IP)');
        setRole((initialData.role as HearingRole) || 'Testemunha');
        setCpf(initialData.cpf || '');
        setRg(initialData.rg || '');
        setPhone(initialData.phone || '');
        setEmail(initialData.email || '');
        setAddress(initialData.address || '');
        setNeighborhood(initialData.neighborhood || '');
        setCity(initialData.city || 'Maracanaú/CE');
        setOfficerName(initialData.officerName || '');
        setClerkName(initialData.clerkName || '');
        setModality(initialData.modality || 'Presencial');
        setLocationOrLink(initialData.locationOrLink || 'Sala de Oitivas 01');
        setStatus(initialData.status || 'Agendada');
        setNotes(initialData.notes || '');
        setIntimationSent(Boolean(initialData.intimationSent));
      } else {
        setPersonName('');
        setDate(defaultDate || new Date().toISOString().split('T')[0]);
        setTime('09:30');
        setProcedureNumber('');
        setProcedureType('Inquérito Policial (IP)');
        setRole('Testemunha');
        setCpf('');
        setRg('');
        setPhone('');
        setEmail('');
        setAddress('');
        setNeighborhood('');
        setCity('Maracanaú/CE');
        setOfficerName('');
        setClerkName('');
        setModality('Presencial');
        setLocationOrLink('Sala de Oitivas 01');
        setStatus('Agendada');
        setNotes('');
        setIntimationSent(false);
      }
      setValidationError(null);
      setActiveTab('depoente');
    }
  }, [isOpen, initialData, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Regra explícita: Nenhum campo além do nome é obrigatório!
    if (!personName.trim()) {
      setValidationError('O nome completo da pessoa a ser ouvida é obrigatório.');
      setActiveTab('depoente');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        personName: personName.trim(),
        date: date || new Date().toISOString().split('T')[0],
        time: time || '09:00',
        procedureNumber: procedureNumber.trim(),
        procedureType,
        role,
        cpf: cpf.trim(),
        rg: rg.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        officerName: officerName.trim(),
        clerkName: clerkName.trim(),
        modality,
        locationOrLink: locationOrLink.trim(),
        status,
        notes: notes.trim(),
        intimationSent
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Erro ao salvar oitiva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
      <div className="bg-[#120f1e] border border-purple-900/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-950/50 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-900/40 bg-[#161226]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {initialData ? 'Editar Oitiva' : 'Nova Entrada de Oitiva'}
              </h2>
              <p className="text-xs text-purple-300/70">
                Apenas o nome do depoente é obrigatório.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-purple-950/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-900/30 bg-[#0e0c18] px-4">
          <button
            type="button"
            onClick={() => setActiveTab('depoente')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'depoente'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Dados do Depoente</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agendamento')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'agendamento'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>2. Data & Local</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('procedimento')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'procedimento'
                ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Procedimento & Notas</span>
          </button>
        </div>

        {/* Validation error banner */}
        {validationError && (
          <div className="m-4 p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            
            {/* TAB 1: DEPOENTE */}
            {activeTab === 'depoente' && (
              <div className="space-y-4">
                
                {/* Nome Completo (OBRIGATÓRIO) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    Nome Completo da Pessoa a Ser Ouvida <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      id="oitiva-person-name"
                      type="text"
                      required
                      placeholder="Ex: João da Silva Santos"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-500/40 focus:border-purple-400 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <p className="text-[10px] text-purple-300/70 mt-1">
                    Este nome será o destaque principal na grade do calendário.
                  </p>
                </div>

                {/* Condição / Papel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Condição / Papel
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as HearingRole)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Testemunha">Testemunha</option>
                      <option value="Vítima">Vítima</option>
                      <option value="Investigado">Investigado</option>
                      <option value="Declarante">Declarante</option>
                      <option value="Representante Legal">Representante Legal</option>
                      <option value="Informante">Informante</option>
                      <option value="Perito">Perito</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* RG & Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      RG / Órgão Emissor (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2008010203 SSP/CE"
                      value={rg}
                      onChange={(e) => setRg(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Telefone / WhatsApp (Opcional)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="(85) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    E-mail (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="depoente@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Endereço & Bairro & Cidade */}
                <div className="space-y-3 pt-2 border-t border-purple-900/20">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Endereço Residencial (Opcional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Rua, número, complemento"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Jereissati, Centro, Piratininga"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Cidade / UF
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Maracanaú/CE"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: AGENDAMENTO (DATA & LOCAL) */}
            {activeTab === 'agendamento' && (
              <div className="space-y-4">
                
                {/* Data e Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-200 mb-1">
                      Data da Oitiva
                    </label>
                    <div className="relative">
                      <CalendarIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-200 mb-1">
                      Horário
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Modalidade */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Modalidade da Oitiva
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Presencial', 'Videoconferência', 'Híbrida'] as HearingModality[]).map((mod) => (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => {
                          setModality(mod);
                          if (mod === 'Videoconferência' && !locationOrLink.includes('http')) {
                            setLocationOrLink('https://meet.google.com/');
                          } else if (mod === 'Presencial' && locationOrLink.includes('http')) {
                            setLocationOrLink('Sala de Oitivas 01');
                          }
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          modality === mod
                            ? 'bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-900/50'
                            : 'bg-[#171326] text-zinc-400 border-purple-900/40 hover:text-zinc-200'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sala / Link */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {modality === 'Videoconferência' ? 'Link da Videoconferência' : 'Sala / Local Físico'}
                  </label>
                  <input
                    type="text"
                    placeholder={modality === 'Videoconferência' ? 'https://meet.google.com/...' : 'Ex: Sala de Oitivas 01 / Cartório Central'}
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HearingStatus)}
                    className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Remarcada">Remarcada</option>
                    <option value="Não Compareceu">Não Compareceu</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                {/* Intimação expedida checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 bg-[#171326] p-3 rounded-xl border border-purple-900/30 hover:border-purple-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={intimationSent}
                      onChange={(e) => setIntimationSent(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-900 bg-zinc-900"
                    />
                    <span className="font-medium">Mandado de intimação já expedido / notificação entregue</span>
                  </label>
                </div>

              </div>
            )}

            {/* TAB 3: PROCEDIMENTO & NOTAS */}
            {activeTab === 'procedimento' && (
              <div className="space-y-4">
                
                {/* Número do Procedimento & Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Número do Procedimento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: IP 123/2026, TCO 045/2026"
                      value={procedureNumber}
                      onChange={(e) => setProcedureNumber(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Tipo de Procedimento
                    </label>
                    <select
                      value={procedureType}
                      onChange={(e) => setProcedureType(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Inquérito Policial (IP)">Inquérito Policial (IP)</option>
                      <option value="Termo Circunstanciado de Ocorrência (TCO)">Termo Circunstanciado (TCO)</option>
                      <option value="Auto de Prisão em Flagrante (APF)">Auto de Prisão em Flagrante (APF)</option>
                      <option value="Boletim de Ocorrência (BO)">Boletim de Ocorrência (BO)</option>
                      <option value="Procedimento Administrativo">Procedimento Administrativo</option>
                      <option value="Carta Precatória">Carta Precatória</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Delegado & Escrivão */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Autoridade Policial / Delegado(a)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dr. Nome do Delegado"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Escrivão(ã) / Responsável
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Escrivão(ã) Fulano"
                      value={clerkName}
                      onChange={(e) => setClerkName(e.target.value)}
                      className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Observações / Notas */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Observações / Anotações Complementares
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Instruções para a oitiva, necessidade de advogado, documentos a apresentar, etc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#171326] border border-purple-900/40 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
                  />
                </div>

              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-purple-900/30 bg-[#161226] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1d182e] hover:bg-[#27203d] text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'procedimento' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'depoente') setActiveTab('agendamento');
                    else if (activeTab === 'agendamento') setActiveTab('procedimento');
                  }}
                  className="px-4 py-2.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  Avançar →
                </button>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Cadastrar Oitiva'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
