import{n as e}from"./chunk-vNrZSFDR.js";import{t}from"./jsx-runtime-1mKRgjuZ.js";import{n,t as r}from"./input-field-D_aw24k5.js";var i,a,o,s,c,l,u,d;e((()=>{i=t(),n(),a={title:`Components/InputField`,component:r,tags:[`autodocs`],args:{placeholder:`Enter text...`}},o={},s={args:{label:`Email address`,placeholder:`you@example.com`}},c={args:{label:`Email address`,placeholder:`you@example.com`,defaultValue:`not-an-email`,error:`Please enter a valid email address.`}},l={args:{label:`Username`,defaultValue:`johndoe`,disabled:!0}},u={render:()=>(0,i.jsxs)(`div`,{className:`flex flex-col gap-6 w-72`,children:[(0,i.jsx)(r,{label:`Default`,placeholder:`Enter text...`}),(0,i.jsx)(r,{label:`With value`,defaultValue:`Hello world`}),(0,i.jsx)(r,{label:`With error`,defaultValue:`bad input`,error:`This field is invalid.`}),(0,i.jsx)(r,{label:`Disabled`,defaultValue:`Can't touch this`,disabled:!0})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    defaultValue: "not-an-email",
    error: "Please enter a valid email address."
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Username",
    defaultValue: "johndoe",
    disabled: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6 w-72">
      <InputField label="Default" placeholder="Enter text..." />
      <InputField label="With value" defaultValue="Hello world" />
      <InputField label="With error" defaultValue="bad input" error="This field is invalid." />
      <InputField label="Disabled" defaultValue="Can't touch this" disabled />
    </div>
}`,...u.parameters?.docs?.source}}},d=[`Default`,`WithLabel`,`WithError`,`Disabled`,`AllStates`]}))();export{u as AllStates,o as Default,l as Disabled,c as WithError,s as WithLabel,d as __namedExportsOrder,a as default};