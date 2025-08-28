// Form helper utilities

type HTMLDataElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export const getDtaFromSubmitEvent = (event: SubmitEvent): Record<string, any> => {
  const formData: Record<string, any> = {}
  const form = event.target as HTMLFormElement
  
  // Get all form controls (inputs, selects, textareas)
  const formControls = form.elements
  
  for (let i = 0; i < formControls.length; i++) {
    const element = formControls[i] as HTMLDataElement
    
    if (element.name && element.name.trim() !== '') {
      const name = element.name
      
      // Handle different input types
      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox') {
          formData[name] = element.checked
        } else if (element.type === 'radio') {
          if (element.checked) {
            formData[name] = element.value
          }
        } else if (element.type === 'file') {
          formData[name] = element.files
        } else {
          formData[name] = element.value
        }
      } else if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        formData[name] = element.value
      }
    }
  }
  
  return formData
}
