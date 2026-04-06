import React, { useState } from 'react';
import { X, Sparkles, Copy, RefreshCw, FileText, PieChart, Download, Calendar, Workflow, ArrowDown, Users, DollarSign, Wallet, Edit3, Plus, Trash2, User } from 'lucide-react';
import { FundingCall, Proposal, TeamMember } from '../types';
import { generateProposal } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProposalModalProps {
  call: FundingCall | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ call, isOpen, onClose }) => {
  const [userIdea, setUserIdea] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', affiliation: '', role: 'Principal Investigator' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'proposal' | 'budget' | 'gantt' | 'flow'>('proposal');
  const [error, setError] = useState<string | null>(null);
  const [lastCallId, setLastCallId] = useState<string | null>(null);

  // Reset state when switching to a different funding call
  if (call && call.id !== lastCallId) {
    setLastCallId(call.id);
    setUserIdea('');
    setTeamMembers([{ name: '', affiliation: '', role: 'Principal Investigator' }]);
    setProposal(null);
    setIsGenerating(false);
    setError(null);
    setActiveTab('proposal');
  }

  if (!isOpen || !call) return null;

  const handleGenerate = async () => {
    if (!userIdea.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Filter out empty rows before sending
      const validTeam = teamMembers.filter(m => m.name.trim() !== '');
      const result = await generateProposal(call, userIdea, validTeam);
      setProposal(result);
    } catch (err) {
      setError("Failed to generate proposal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setProposal(null);
    setUserIdea('');
    setTeamMembers([{ name: '', affiliation: '', role: 'Principal Investigator' }]);
    setError(null);
    setActiveTab('proposal');
  };

  const handleRedraft = () => {
    setProposal(null);
    setError(null);
    setActiveTab('proposal');
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', affiliation: '', role: 'Co-Investigator' }]);
  };

  const removeTeamMember = (index: number) => {
    const newTeam = [...teamMembers];
    newTeam.splice(index, 1);
    setTeamMembers(newTeam);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...teamMembers];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setTeamMembers(newTeam);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatProposalText = (p: Proposal) => {
    const teamText = p.teamMembers && p.teamMembers.length > 0
      ? `PROJECT TEAM:\n${p.teamMembers.map(m => `${m.role}: ${m.name} (${m.affiliation})`).join('\n')}\n`
      : '';

    return `
PROJECT TITLE: ${p.projectTitle}

${teamText}
EXECUTIVE SUMMARY:
${p.executiveSummary}

PROBLEM STATEMENT:
${p.problemStatement}

OBJECTIVES:
${p.objectives.map(o => `- ${o}`).join('\n')}

METHODOLOGY:
${p.methodology}

IMPACT:
${p.impact}

TIMELINE:
${p.timeline}
    `.trim();
  };

  const handleDownloadDocx = async () => {
    if (!proposal || !call) return;

    // Helper to create a section header
    const createHeading = (text: string) => {
      return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      });
    };

    // Helper to create body text
    const createBody = (text: string) => {
      return new Paragraph({
        children: [new TextRun(text)],
        spacing: { after: 200 },
      });
    };

    // Helper to create list items
    const createList = (items: string[]) => {
      return items.map(item => 
        new Paragraph({
          text: item,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    };

    // Team Table
    const teamRows = proposal.teamMembers && proposal.teamMembers.length > 0 ? [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Role", style: "Strong" })], width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Name", style: "Strong" })], width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Affiliation", style: "Strong" })], width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
        ],
      }),
      ...proposal.teamMembers.map(m => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(m.role)] }),
            new TableCell({ children: [new Paragraph(m.name)] }),
            new TableCell({ children: [new Paragraph(m.affiliation)] }),
          ],
        })
      )
    ] : [];

    // Create Expenses Table
    const budgetRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Category", checking: { type: "auto" }, style: "Strong" })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Item", style: "Strong" })], width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Justification", style: "Strong" })], width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Cost", style: "Strong" })], width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
        ],
      }),
      ...proposal.budgetItems.map(item => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.category)] }),
            new TableCell({ children: [new Paragraph(item.item)] }),
            new TableCell({ children: [new Paragraph(item.justification)] }),
            new TableCell({ children: [new Paragraph(item.cost)] }),
          ],
        })
      ),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "TOTAL EXPENSES", style: "Strong" })], columnSpan: 3, shading: { fill: "F0F0F0" } }),
          new TableCell({ children: [new Paragraph({ text: proposal.totalBudget, style: "Strong" })], shading: { fill: "F0F0F0" } }),
        ]
      })
    ];

    // Create Income Table (Optional display in docx if data exists, although hidden in UI tab)
    const incomeRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Funding Source", style: "Strong" })], width: { size: 50, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Status", style: "Strong" })], width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Amount", style: "Strong" })], width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
        ],
      }),
      ...(proposal.incomeItems || []).map(item => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.source)] }),
            new TableCell({ children: [new Paragraph(item.status)] }),
            new TableCell({ children: [new Paragraph(item.amount)] }),
          ],
        })
      )
    ];

    // Create Resources Table
    const resourceRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Role", style: "Strong" })], width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Count", style: "Strong" })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Duration", style: "Strong" })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
          new TableCell({ children: [new Paragraph({ text: "Key Responsibility", style: "Strong" })], width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
        ],
      }),
      ...(proposal.resourceAllocations || []).map(res => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(res.role)] }),
            new TableCell({ children: [new Paragraph(res.count.toString())] }),
            new TableCell({ children: [new Paragraph(res.duration)] }),
            new TableCell({ children: [new Paragraph(res.responsibility)] }),
          ],
        })
      )
    ];

    const children = [
      // Title
      new Paragraph({
        text: proposal.projectTitle,
        heading: HeadingLevel.TITLE,
        alignment: "center",
        spacing: { after: 400 },
      }),
    ];

    // Add Team Section if available
    if (proposal.teamMembers && proposal.teamMembers.length > 0) {
      children.push(createHeading("Project Team"));
      children.push(new Table({
        rows: teamRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        }
      }));
    }

    children.push(createHeading("Executive Summary"));
    children.push(createBody(proposal.executiveSummary));
    children.push(createHeading("Problem Statement"));
    children.push(createBody(proposal.problemStatement));
    children.push(createHeading("Objectives"));
    children.push(...createList(proposal.objectives));
    children.push(createHeading("Methodology"));
    children.push(createBody(proposal.methodology));
    children.push(createHeading("Impact"));
    children.push(createBody(proposal.impact));
    children.push(createHeading("Execution Plan"));
    children.push(...(proposal.executionSteps || []).map(step => 
      new Paragraph({
        children: [
          new TextRun({ text: `Step ${step.stepNumber}: ${step.title}`, bold: true }),
          new TextRun({ text: ` - ${step.description}`})
        ],
        spacing: { after: 100 }
      })
    ));

    // Financials
    children.push(new Paragraph({ text: "Financial Plan", heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 } }));
    children.push(new Paragraph({ text: "Projected Expenses", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
    children.push(new Table({
      rows: budgetRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      }
    }));

    children.push(new Paragraph({ text: "Income & Funding Sources", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
    children.push(new Table({
      rows: incomeRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      }
    }));

    children.push(new Paragraph({ text: "Resource Allocation", heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 } }));
    children.push(new Table({
      rows: resourceRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      }
    }));

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${proposal.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_proposal.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const ganttData = proposal?.timelinePhases?.map(phase => ({
    name: phase.phase,
    startOffset: phase.startMonth - 1, 
    duration: phase.durationMonths
  })) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-[#00629B] px-4 py-4 sm:px-6 flex justify-between items-center shrink-0">
            <div className="text-white">
              <h3 className="text-lg font-semibold leading-6" id="modal-title">
                {proposal ? 'Draft Proposal Generated' : 'Draft New Proposal'}
              </h3>
              <p className="text-blue-200 text-sm truncate max-w-md">
                Target: {call.title}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {!proposal ? (
              // Input State
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-gray-900 font-medium mb-2">1. The Opportunity</h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 mb-4">
                    <p><strong>Organization:</strong> {call.organization}</p>
                    <p><strong>Funding:</strong> {call.amount}</p>
                    <p className="mt-1">{call.description}</p>
                  </div>

                  <h4 className="text-gray-900 font-medium mb-2">2. Your Project Idea</h4>
                  <p className="text-sm text-gray-500 mb-3">Briefly describe what you want to do. The AI will handle the professional formatting, structure, budget details, and project timeline.</p>
                  <textarea
                    value={userIdea}
                    onChange={(e) => setUserIdea(e.target.value)}
                    className="w-full h-32 rounded-lg border-gray-300 shadow-sm focus:border-[#00629B] focus:ring-[#00629B] p-3 text-gray-900"
                    placeholder="e.g., I want to organize a hackathon for local high school students to teach them Python and robotics using Arduino kits..."
                  ></textarea>

                  <h4 className="text-gray-900 font-medium mb-2 mt-6">3. Investigator Details</h4>
                  <div className="space-y-3">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm text-sm p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Affiliation (University/Company)"
                            value={member.affiliation}
                            onChange={(e) => updateTeamMember(idx, 'affiliation', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm text-sm p-2"
                          />
                        </div>
                        <div className="w-1/3">
                          <select
                            value={member.role}
                            onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm text-sm p-2 bg-white"
                          >
                            <option value="Principal Investigator">Principal Investigator</option>
                            <option value="Co-Investigator">Co-Investigator</option>
                            <option value="Collaborator">Collaborator</option>
                            <option value="Mentor">Mentor</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeTeamMember(idx)}
                          disabled={teamMembers.length <= 1}
                          className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addTeamMember}
                      className="inline-flex items-center text-sm text-[#00629B] font-medium hover:text-blue-800 transition-colors mt-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Team Member
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={!userIdea.trim() || isGenerating}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#00629B] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Generating Draft...
                      </>
                    ) : (
                      <>
                        <Sparkles className="-ml-1 mr-2 h-5 w-5" />
                        Generate Proposal & Budget
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Result State
              <div className="h-full flex flex-col">
                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 shrink-0 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('proposal')}
                    className={`flex items-center justify-center w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                      ${activeTab === 'proposal' 
                        ? 'bg-white text-[#00629B] shadow' 
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Proposal
                  </button>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className={`flex items-center justify-center w-full min-w-[110px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                      ${activeTab === 'budget' 
                        ? 'bg-white text-[#00629B] shadow' 
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`
                    }
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Budget
                  </button>
                  <button
                    onClick={() => setActiveTab('gantt')}
                    className={`flex items-center justify-center w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                      ${activeTab === 'gantt' 
                        ? 'bg-white text-[#00629B] shadow' 
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`
                    }
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Gantt
                  </button>
                  <button
                    onClick={() => setActiveTab('flow')}
                    className={`flex items-center justify-center w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                      ${activeTab === 'flow' 
                        ? 'bg-white text-[#00629B] shadow' 
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'}`
                    }
                  >
                    <Workflow className="w-4 h-4 mr-2" />
                    Flow Chart
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-y-auto text-left">
                  {activeTab === 'proposal' && (
                    <div className="prose prose-blue max-w-none">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 m-0">{proposal.projectTitle}</h2>
                        <button 
                          onClick={() => copyToClipboard(formatProposalText(proposal))}
                          className="text-gray-400 hover:text-[#00629B] p-1"
                          title="Copy text"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Team Section in Display */}
                      {proposal.teamMembers && proposal.teamMembers.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Project Team</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {proposal.teamMembers.map((member, idx) => (
                              <div key={idx} className="flex items-start">
                                <div className="bg-white p-2 rounded-full border border-gray-200 mr-3">
                                  <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                                  <p className="text-gray-600 text-xs">{member.role}</p>
                                  <p className="text-gray-500 text-xs italic">{member.affiliation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Executive Summary</h3>
                          <p className="text-gray-700 leading-relaxed">{proposal.executiveSummary}</p>
                        </section>
                        
                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Problem Statement</h3>
                          <p className="text-gray-700 leading-relaxed">{proposal.problemStatement}</p>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Objectives</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {proposal.objectives.map((obj, i) => (
                              <li key={i} className="text-gray-700">{obj}</li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Methodology</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.methodology}</p>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Impact</h3>
                          <p className="text-gray-700 leading-relaxed">{proposal.impact}</p>
                        </section>

                        <section>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Timeline Description</h3>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.timeline}</p>
                        </section>
                      </div>
                    </div>
                  )}

                  {activeTab === 'budget' && (
                    <div className="space-y-8">
                        {/* Expenses Section */}
                        <div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-[#00629B]" />
                            Proposed Project Budget
                          </h3>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total Requested</p>
                            <p className="text-xl font-bold text-gray-900">{proposal.totalBudget}</p>
                          </div>
                        </div>

                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Category</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Item</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Justification</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {proposal.budgetItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.category}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{item.item}</td>
                                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">{item.justification}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-medium">{item.cost}</td>
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                        <p className="flex items-start">
                          <span className="font-bold mr-1">Note:</span> 
                          Figures are AI-generated estimates. Please verify actual costs and confirm funding sources before submission.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'gantt' && (
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Project Gantt Chart</h3>
                        <p className="text-sm text-gray-500">Execution Timeline by Phase</p>
                      </div>
                      
                      {ganttData.length > 0 ? (
                        <div className="flex-1 min-h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={ganttData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                              barSize={30}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" label={{ value: 'Month', position: 'insideBottom', offset: -10 }} />
                              <YAxis type="category" dataKey="name" width={150} />
                              <Tooltip cursor={{ fill: 'transparent' }} />
                              <Bar dataKey="startOffset" stackId="a" fill="transparent" />
                              <Bar dataKey="duration" stackId="a" fill="#00629B" radius={[0, 4, 4, 0]} name="Duration (Months)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <p>No timeline data available for this proposal.</p>
                        </div>
                      )}
                      
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 mt-4">
                        <p className="font-medium mb-1">Timeline Overview:</p>
                        <p className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm">{proposal.timeline}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'flow' && (
                      <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Execution Flow Chart</h3>
                          <p className="text-sm text-gray-500">Process Steps</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4">
                          {(proposal.executionSteps && proposal.executionSteps.length > 0) ? (
                            <div className="max-w-2xl mx-auto space-y-2">
                              {proposal.executionSteps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  {/* Step Card */}
                                  <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 relative hover:shadow-md transition-shadow hover:border-[#00629B]">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#00629B] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                                      {step.stepNumber}
                                    </div>
                                    <h4 className="font-bold text-gray-900 ml-4">{step.title}</h4>
                                    <p className="text-sm text-gray-600 ml-4 mt-1">{step.description}</p>
                                  </div>
                                  
                                  {/* Connector */}
                                  {index < proposal.executionSteps.length - 1 && (
                                    <div className="h-8 border-l-2 border-dashed border-gray-300 my-1 relative">
                                      <ArrowDown className="w-4 h-4 text-gray-300 absolute -bottom-2 -left-[8px]" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                              <Workflow className="w-12 h-12 mb-2 opacity-20" />
                              <p>No execution flow data available.</p>
                            </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {proposal && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 shrink-0 gap-3">
              <button
                type="button"
                onClick={handleDownloadDocx}
                className="inline-flex w-full justify-center items-center rounded-md bg-[#00629B] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download .docx
              </button>
              <button
                type="button"
                onClick={handleRedraft}
                className="mt-3 inline-flex w-full justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Redraft
              </button>
              <button
                type="button"
                onClick={reset}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                New Proposal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};