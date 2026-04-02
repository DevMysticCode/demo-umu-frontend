import type { Rule } from '~/types/homescore'

export const RULES: Rule[] = [
  {
    id: 'old_boiler',
    condition: (a) => a.heatingType === 'old_gas',
    flag: {
      title: 'Ageing Boiler',
      detail: 'Boilers over 20 years old are inefficient and at high risk of breaking down. This will flag on any survey.',
      severity: 'high',
    },
    action: { text: 'Service or replace your boiler', points: 5 },
    priority: 1,
  },
  {
    id: 'no_heating',
    condition: (a) => a.heatingType === 'none',
    flag: {
      title: 'No Central Heating',
      detail: 'No central heating system significantly impacts liveability, EPC rating, and property value.',
      severity: 'high',
    },
    action: { text: 'Install a central heating system', points: 8 },
    priority: 1,
  },
  {
    id: 'very_old_electrics',
    condition: (a) => a.consumerUnit === 'very_old',
    flag: {
      title: 'Outdated Electrics',
      detail: 'Very old consumer units present a safety risk and will flag on a EICR report.',
      severity: 'high',
    },
    action: { text: 'Rewire and install a modern consumer unit', points: 6 },
    priority: 1,
  },
  {
    id: 'old_pipes',
    condition: (a) => a.pipes === 'old',
    flag: {
      title: 'Old Pipework',
      detail: 'Lead or galvanised pipes are a health risk and prone to leaks. Lenders may refuse mortgages.',
      severity: 'high',
    },
    action: { text: 'Replace old lead or galvanised pipework', points: 4 },
    priority: 1,
  },
  {
    id: 'single_glazed',
    condition: (a) => a.windows === 'single',
    flag: {
      title: 'Single Glazed Windows',
      detail: 'Single glazing causes significant heat loss, reduces comfort and lowers your EPC rating.',
      severity: 'medium',
    },
    action: { text: 'Upgrade to double glazed windows', points: 7 },
    priority: 2,
  },
  {
    id: 'poor_loft',
    condition: (a) => a.loftInsulation === 'minimal',
    flag: {
      title: 'Poor Loft Insulation',
      detail: 'Up to 25% of heat escapes through the roof. Loft insulation is one of the most cost-effective improvements.',
      severity: 'medium',
    },
    action: { text: 'Top up loft insulation to 270mm+', points: 5 },
    priority: 2,
  },
  {
    id: 'uninsulated_walls',
    condition: (a) => a.wallType === 'cavity_uninsulated' || a.wallType === 'solid_uninsulated',
    flag: {
      title: 'Uninsulated Walls',
      detail: 'Uninsulated walls are the single biggest cause of heat loss in older homes.',
      severity: 'medium',
    },
    action: { text: 'Install cavity or solid wall insulation', points: 6 },
    priority: 2,
  },
  {
    id: 'old_fusebox',
    condition: (a) => a.consumerUnit === 'old',
    flag: {
      title: 'Old Fusebox',
      detail: 'Old-style fuseboxes may not meet current safety standards and can slow down sales.',
      severity: 'medium',
    },
    action: { text: 'Upgrade to a modern consumer unit', points: 4 },
    priority: 2,
  },
  {
    id: 'not_serviced',
    condition: (a) => a.lastServiced === 'never',
    flag: {
      title: 'Boiler Not Serviced',
      detail: 'Annual boiler servicing improves efficiency, extends lifespan, and is required by most warranties.',
      severity: 'low',
    },
    action: { text: 'Book an annual boiler service', points: 3 },
    priority: 3,
  },
  {
    id: 'low_pressure',
    condition: (a) => a.waterPressure === 'very_low',
    flag: {
      title: 'Low Water Pressure',
      detail: 'Very low water pressure may indicate pipe blockages or mains supply issues.',
      severity: 'medium',
    },
    action: { text: 'Have water pressure professionally investigated', points: 3 },
    priority: 3,
  },
]

export function getActiveRules(answers: Partial<Record<string, string>>) {
  return RULES
    .filter(r => r.condition(answers as any))
    .sort((a, b) => a.priority - b.priority)
}
