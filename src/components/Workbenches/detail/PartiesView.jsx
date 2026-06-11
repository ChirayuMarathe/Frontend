import React, { useState, useEffect, useCallback } from "react";
import { 
  BsBuilding, 
  BsPersonBadge, 
  BsCheckCircleFill, 
  BsXCircleFill,
  BsSearch,
  BsFilter,
  BsArrowRight,
  BsPlusLg,
  BsBank,
  BsCashStack,
  BsShieldCheck,
  BsPerson
} from "react-icons/bs";
import Card from "../../shared/Card";
import PartyModal from "../ops/PartyModal";
import { useWorkbench } from "../../../context/WorkbenchContext";

export default function PartiesView({ workbenchId }) {
  const { parties, loading, refreshContext } = useWorkbench();
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState({ mode: "party", party: null });

  const openAddVessel = (party) => {
    setModalOptions({ mode: "entity", party });
    setIsModalOpen(true);
  };

  const filteredParties = Array.isArray(parties) ? parties.filter(party => {
    const matchesSearch = party.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && party.category === filter;
  }) : [];

  const getCategoryConfig = (category, isSelf) => {
    if (isSelf) return { label: 'Self (Owner)', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: BsShieldCheck };
    switch (category) {
      case 'individual': return { label: 'Individual', color: 'text-teal-400', bg: 'bg-teal-400/10', icon: BsPerson };
      case 'corporation': return { label: 'Corporation', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: BsBuilding };
      case 'group': return { label: 'Group', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: BsPersonBadge };
      default: return { label: category, color: 'text-gray-400', bg: 'bg-gray-400/10', icon: BsBuilding };
    }
  };

  const getEntityConfig = (type) => {
    switch (type) {
      case 'bank': return { label: 'Bank Transfer', color: 'text-teal-400', icon: BsBank };
      case 'upi': return { label: 'UPI / QR', color: 'text-purple-400', icon: BsArrowRight };
      case 'cash': return { label: 'Cash / Wallet', color: 'text-orange-400', icon: BsCashStack };
      case 'property': return { label: 'Property / Office', color: 'text-rose-400', icon: BsBuilding };
      default: return { label: type, color: 'text-gray-400', icon: BsBuilding };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Parties & Entities</h3>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Individuals representing trade vessels</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-teal-500 text-black rounded-xl hover:bg-teal-400 transition-all text-sm font-bold shadow-lg shadow-teal-500/20"
          >
            <BsPlusLg />
            <span>Manage Parties</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input 
            type="text"
            placeholder="Search parties by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50 transition-all"
          />
        </div>
        
        <div className="flex p-1 bg-black/20 border border-white/5 rounded-xl overflow-x-auto no-scrollbar">
          {["all", "individual", "corporation", "group"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? "bg-white/10 text-white shadow-lg border border-white/10" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading Records...</span>
            </div>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <div className="flex flex-col items-center space-y-4 opacity-50">
              <BsPerson size={48} className="text-gray-700" />
              <p className="text-gray-500 text-sm font-medium">No records found for this filter.</p>
            </div>
          </div>
        ) : (
          filteredParties.map((party) => {
            const config = getCategoryConfig(party.category, party.is_self);
            return (
              <div key={party.id} className={`bg-white/[0.02] border rounded-3xl overflow-hidden hover:border-teal-500/30 transition-all group ${party.is_self ? 'border-amber-500/20 ring-1 ring-amber-500/10 shadow-lg shadow-amber-500/5' : 'border-white/5'}`}>
                <div className="p-6 border-b border-white/5 relative">
                  {party.is_self && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-tighter rounded-bl-xl shadow-lg">
                      OWNER ENTITY
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${config.bg} ${config.color} border border-current/10 shadow-inner`}>
                      <config.icon className="text-xl" />
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color} border border-current/20`}>
                      {config.label}
                    </span>
                  </div>
                  <h4 className={`text-lg font-bold transition-colors ${party.is_self ? 'text-amber-400 group-hover:text-amber-300' : 'text-white group-hover:text-teal-400'}`}>{party.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Party Identity</p>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Trade Vessels</span>
                    <button 
                      onClick={() => openAddVessel(party)}
                      className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest"
                    >
                      + Add Vessel
                    </button>
                  </div>
                  
                  {party.entities?.length === 0 ? (
                    <div className="py-4 text-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-600 italic">No vessels linked</p>
                    </div>
                  ) : (
                    party.entities?.map(entity => {
                      const eConfig = getEntityConfig(entity.type);
                      return (
                        <div key={entity.id} className="flex flex-col p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <eConfig.icon className={`${eConfig.color} text-sm`} />
                              <div>
                                <div className="text-xs font-bold text-gray-300">{entity.name}</div>
                                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{eConfig.label}</div>
                              </div>
                            </div>
                            <BsArrowRight className="text-gray-700" size={14} />
                          </div>

                          {/* Metadata Display */}
                          {entity.type === "bank" && entity.metadata?.account_no && (
                            <div className="flex flex-col space-y-1 pl-7 border-l border-white/5">
                              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                                <span>A/C: {entity.metadata.account_no}</span>
                                <span className="opacity-50">{entity.metadata.ifsc}</span>
                              </div>
                              {entity.metadata.bank_name && <div className="text-[8px] font-bold text-gray-600 uppercase">{entity.metadata.bank_name}</div>}
                            </div>
                          )}
                          {entity.type === "upi" && entity.metadata?.upi_id && (
                            <div className="pl-7 border-l border-white/5">
                              <div className="text-[9px] font-mono text-purple-400/70">{entity.metadata.upi_id}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {(party.email || party.phone) && (
                  <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex flex-col space-y-1">
                    {party.email && <span className="text-[10px] font-medium text-gray-500">{party.email}</span>}
                    {party.phone && <span className="text-[10px] font-mono text-gray-600">{party.phone}</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <PartyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workbenchId={workbenchId}
        onSuccess={refreshContext}
        initialMode={modalOptions.mode}
        initialParty={modalOptions.party}
      />
    </div>
  );
}
