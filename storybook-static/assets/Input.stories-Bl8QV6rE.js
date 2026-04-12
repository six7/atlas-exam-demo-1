import{n as e,o as t}from"./chunk-vNrZSFDR.js";import{t as n}from"./react-KkzZQhs-.js";import{t as r}from"./jsx-runtime-1mKRgjuZ.js";import{n as i,t as a}from"./utils-C_6qgufy.js";var o,s,c,l=e((()=>{o=r(),s=t(n()),i(),c=s.forwardRef(({className:e,type:t,...n},r)=>(0,o.jsx)(`input`,{type:t,className:a(`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,e),ref:r,...n})),c.displayName=`Input`,c.__docgenInfo={description:``,methods:[],displayName:`Input`}}));function u({label:e,error:t,className:n,id:r,...i}){let o=(0,f.useId)(),s=r??o;return(0,d.jsxs)(`div`,{className:`flex flex-col gap-1.5`,children:[e&&(0,d.jsx)(`label`,{htmlFor:s,className:`text-sm font-medium text-foreground`,children:e}),(0,d.jsx)(c,{id:s,className:a(t&&`border-destructive focus-visible:ring-destructive`,n),"aria-describedby":t?`${s}-error`:void 0,"aria-invalid":t?!0:void 0,...i}),t&&(0,d.jsx)(`p`,{id:`${s}-error`,className:`text-sm text-destructive`,children:t})]})}var d,f,p=e((()=>{d=r(),f=t(n()),l(),i(),u.__docgenInfo={description:``,methods:[],displayName:`Input`,props:{label:{required:!1,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``}},composes:[`InputHTMLAttributes`]}})),m,h,g,_,v,y,b,x;e((()=>{m=r(),p(),h={title:`Components/Input`,component:u,tags:[`autodocs`],args:{placeholder:`Enter text...`}},g={},_={args:{label:`Email address`,placeholder:`you@example.com`}},v={args:{label:`Email address`,placeholder:`you@example.com`,defaultValue:`not-an-email`,error:`Please enter a valid email address.`}},y={args:{label:`Username`,defaultValue:`johndoe`,disabled:!0}},b={render:()=>(0,m.jsxs)(`div`,{className:`flex flex-col gap-6 w-72`,children:[(0,m.jsx)(u,{label:`Default`,placeholder:`Enter text...`}),(0,m.jsx)(u,{label:`With value`,defaultValue:`Hello world`}),(0,m.jsx)(u,{label:`With error`,defaultValue:`bad input`,error:`This field is invalid.`}),(0,m.jsx)(u,{label:`Disabled`,defaultValue:`Can't touch this`,disabled:!0})]})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com"
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    defaultValue: "not-an-email",
    error: "Please enter a valid email address."
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Username",
    defaultValue: "johndoe",
    disabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6 w-72">
      <Input label="Default" placeholder="Enter text..." />
      <Input label="With value" defaultValue="Hello world" />
      <Input label="With error" defaultValue="bad input" error="This field is invalid." />
      <Input label="Disabled" defaultValue="Can't touch this" disabled />
    </div>
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithLabel`,`WithError`,`Disabled`,`AllStates`]}))();export{b as AllStates,g as Default,y as Disabled,v as WithError,_ as WithLabel,x as __namedExportsOrder,h as default};