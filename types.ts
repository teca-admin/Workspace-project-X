
import React from 'react';

export enum View {
  HOME = 'HOME',         // HOME
  TOOLS = 'TOOLS',       // FERRAMENTA
  PROJECTS = 'PROJECTS', // PROJETOS
  NOTES = 'NOTES',       // NOTAS
  DEMANDS = 'DEMANDS',   // DEMANDAS
  ARTIFACTS = 'ARTIFACTS', // ARTEFATOS (Antiga Library)
  DASHBOARD = 'DASHBOARD' // PAINEL
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<any>;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface Tool {
  id: string;
  title: string;       
  description: string; 
  url: string;
  icon?: string;       
  category?: string;   
  parentId?: string | null; 
  isFolder?: boolean;       
  createdAt?: Date;    
  updatedAt?: Date;    
}

export interface Note {
  id: string;
  title: string;       
  content: string;     
  createdAt: Date;     
  updatedAt: Date;     
}

export interface ArtifactCollection {
  id: string;
  name: string;         
  icon: string;         
  color?: string;       
  description?: string; 
  updatedAt?: Date;
}

export interface Artifact {
  id: string;
  collectionId: string; 
  title: string;        
  content: string;      
  description?: string; 
  type: 'code' | 'text' | 'spell' | 'pdf' | 'word' | 'excel' | 'powerpoint'; 
  createdAt: Date;      
  updatedAt?: Date;     
  icon?: string;        
  color?: string;       
}

// Interfaces para Demandas
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
export type DemandPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Demand {
  id: string;
  title: string;
  description: string;
  status: DemandStatus;
  priority: DemandPriority;
  category: string;
  deadline?: string;
  createdAt: Date;
  updatedAt: Date;
}
