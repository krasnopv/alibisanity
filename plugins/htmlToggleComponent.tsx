import React, {useState} from 'react'
import {PortableTextEditor} from '@sanity/portable-text-editor'
import {Button, Flex} from '@sanity/ui'

interface HtmlToggleProps {
  value: any
  onChange: (value: any) => void
}

export function HtmlToggleComponent({value, onChange}: HtmlToggleProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlValue, setHtmlValue] = useState('')

  const toggleMode = () => {
    if (isHtmlMode) {
      // Convert HTML back to Portable Text
      // This would require a custom converter
      setIsHtmlMode(false)
    } else {
      // Convert Portable Text to HTML
      // This would require a custom converter
      setHtmlValue('<!-- Converted HTML would go here -->')
      setIsHtmlMode(true)
    }
  }

  return (
    <Flex direction="column" gap={2}>
      <Button 
        text={isHtmlMode ? 'Visual Editor' : 'HTML Editor'}
        onClick={toggleMode}
        tone="primary"
      />
      {isHtmlMode ? (
        <textarea
          value={htmlValue}
          onChange={(e) => setHtmlValue(e.target.value)}
          style={{width: '100%', minHeight: '200px'}}
        />
      ) : (
        <div>WYSIWYG Editor would go here</div>
      )}
    </Flex>
  )
}
