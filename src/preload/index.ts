import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Plants
  getPlants: (filters?: any) => ipcRenderer.invoke('db:plants:getAll', filters),
  getPlantById: (id: number) => ipcRenderer.invoke('db:plants:getById', id),

  // Ailments
  getAilments: (filters?: any) => ipcRenderer.invoke('db:ailments:getAll', filters),
  getAilmentById: (id: number) => ipcRenderer.invoke('db:ailments:getById', id),

  // Astrology
  getZodiacSigns: () => ipcRenderer.invoke('db:zodiac:getAll'),
  getZodiacSignById: (id: number) => ipcRenderer.invoke('db:zodiac:getById', id),
  getPlanets: () => ipcRenderer.invoke('db:planets:getAll'),
  getPlanetById: (id: number) => ipcRenderer.invoke('db:planets:getById', id),

  // Preparations
  getPreparations: () => ipcRenderer.invoke('db:preparations:getAll'),
  getPreparationById: (id: number) => ipcRenderer.invoke('db:preparations:getById', id),

  // Cross-Reference
  crossReference: (params: any) => ipcRenderer.invoke('db:crossref:query', params),
  crossReferenceContraindications: (params: any) => ipcRenderer.invoke('db:crossref:contraindications', params),

  // Compounds
  getCompounds: () => ipcRenderer.invoke('db:compounds:getAll'),

  // Body Systems
  getBodySystems: () => ipcRenderer.invoke('db:bodySystems:getAll'),
  getBodySystemById: (id: number) => ipcRenderer.invoke('db:bodySystems:getById', id),
  getBodySystemByName: (name: string) => ipcRenderer.invoke('db:bodySystems:getByName', name),

  // Plant Teachings
  getAllTeachings: () => ipcRenderer.invoke('db:teachings:getAll'),
  getTeachingsByPlantId: (plantId: number) => ipcRenderer.invoke('db:teachings:getByPlantId', plantId),

  // Plant Presence Energetics
  getPresenceByPlantId: (plantId: number) => ipcRenderer.invoke('db:presence:getByPlantId', plantId),

  // Journal
  getJournalPrompts: (filters?: any) => ipcRenderer.invoke('db:journal:getPrompts', filters),
  getJournalEntries: (filters?: any) => ipcRenderer.invoke('db:journal:getEntries', filters),
  createJournalEntry: (entry: any) => ipcRenderer.invoke('db:journal:createEntry', entry),
  updateJournalEntry: (id: number, updates: any) => ipcRenderer.invoke('db:journal:updateEntry', id, updates),
  deleteJournalEntry: (id: number) => ipcRenderer.invoke('db:journal:deleteEntry', id)
}

contextBridge.exposeInMainWorld('api', api)
