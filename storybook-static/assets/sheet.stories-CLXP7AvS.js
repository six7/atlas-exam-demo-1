import{n as e,o as t}from"./chunk-vNrZSFDR.js";import{t as n}from"./react-KkzZQhs-.js";import{t as r}from"./jsx-runtime-1mKRgjuZ.js";import{n as i,t as a}from"./utils-C_6qgufy.js";import{i as o,n as s,r as c,t as l}from"./button-CYvc_U_-.js";import{n as u,t as d}from"./input-field-D_aw24k5.js";import{n as f,t as p}from"./lucide-react-CC6EpCzj.js";import{a as m,c as h,i as g,l as _,n as v,o as y,r as b,s as x,t as S}from"./dist-CmMM1QLY.js";var C,w,T,E,D,O,k,A,j,M,N,P,F=e((()=>{C=r(),w=t(n()),_(),o(),p(),i(),T=y,E=h,D=m,O=w.forwardRef(({className:e,...t},n)=>(0,C.jsx)(g,{className:a(`fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`,e),...t,ref:n})),O.displayName=g.displayName,k=c(`fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500`,{variants:{side:{top:`inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top`,bottom:`inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom`,left:`inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm`,right:`inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm`}},defaultVariants:{side:`right`}}),A=w.forwardRef(({side:e=`right`,className:t,children:n,...r},i)=>(0,C.jsxs)(D,{children:[(0,C.jsx)(O,{}),(0,C.jsxs)(v,{ref:i,className:a(k({side:e}),t),...r,children:[n,(0,C.jsxs)(S,{className:`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary`,children:[(0,C.jsx)(f,{className:`h-4 w-4`}),(0,C.jsx)(`span`,{className:`sr-only`,children:`Close`})]})]})]})),A.displayName=v.displayName,j=({className:e,...t})=>(0,C.jsx)(`div`,{className:a(`flex flex-col space-y-2 text-center sm:text-left`,e),...t}),j.displayName=`SheetHeader`,M=({className:e,...t})=>(0,C.jsx)(`div`,{className:a(`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`,e),...t}),M.displayName=`SheetFooter`,N=w.forwardRef(({className:e,...t},n)=>(0,C.jsx)(x,{ref:n,className:a(`text-lg font-semibold text-foreground`,e),...t})),N.displayName=x.displayName,P=w.forwardRef(({className:e,...t},n)=>(0,C.jsx)(b,{ref:n,className:a(`text-sm text-muted-foreground`,e),...t})),P.displayName=b.displayName,O.__docgenInfo={description:``,methods:[]},A.__docgenInfo={description:``,methods:[],props:{side:{defaultValue:{value:`"right"`,computed:!1},required:!1}},composes:[`VariantProps`]},j.__docgenInfo={description:``,methods:[],displayName:`SheetHeader`},M.__docgenInfo={description:``,methods:[],displayName:`SheetFooter`},N.__docgenInfo={description:``,methods:[]},P.__docgenInfo={description:``,methods:[]}})),I,L,R,z,B,V;e((()=>{I=r(),s(),F(),u(),L={title:`Components/Sheet`,tags:[`autodocs`]},R={render:()=>(0,I.jsxs)(T,{children:[(0,I.jsx)(E,{asChild:!0,children:(0,I.jsx)(l,{variant:`outline`,children:`Open sheet`})}),(0,I.jsxs)(A,{children:[(0,I.jsxs)(j,{children:[(0,I.jsx)(N,{children:`Sheet title`}),(0,I.jsx)(P,{children:`This is a side panel. It slides in from the right edge.`})]}),(0,I.jsx)(`div`,{className:`py-4`,children:(0,I.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Your content goes here.`})}),(0,I.jsx)(M,{children:(0,I.jsx)(l,{children:`Save changes`})})]})]})},z={render:()=>(0,I.jsxs)(T,{children:[(0,I.jsx)(E,{asChild:!0,children:(0,I.jsx)(l,{variant:`secondary`,children:`Edit settings`})}),(0,I.jsxs)(A,{children:[(0,I.jsxs)(j,{children:[(0,I.jsx)(N,{children:`Profile settings`}),(0,I.jsx)(P,{children:`Update your display name and email address.`})]}),(0,I.jsxs)(`div`,{className:`flex flex-col gap-4 py-4`,children:[(0,I.jsx)(d,{label:`Display name`,defaultValue:`Maya Keller`}),(0,I.jsx)(d,{label:`Email`,defaultValue:`maya@atlas.design`}),(0,I.jsx)(d,{label:`Role`,defaultValue:`Design Lead`})]}),(0,I.jsxs)(M,{children:[(0,I.jsx)(l,{variant:`ghost`,children:`Cancel`}),(0,I.jsx)(l,{children:`Save`})]})]})]})},B={render:()=>(0,I.jsxs)(T,{children:[(0,I.jsx)(E,{asChild:!0,children:(0,I.jsx)(l,{variant:`ghost`,children:`Open left sheet`})}),(0,I.jsxs)(A,{side:`left`,children:[(0,I.jsx)(j,{children:(0,I.jsx)(N,{children:`Navigation`})}),(0,I.jsxs)(`nav`,{className:`flex flex-col gap-2 mt-4`,children:[(0,I.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-2 rounded hover:bg-muted`,children:`Dashboard`}),(0,I.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-2 rounded hover:bg-muted`,children:`Projects`}),(0,I.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-2 rounded hover:bg-muted`,children:`Settings`})]})]})]})},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>
            This is a side panel. It slides in from the right edge.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Your content goes here.</p>
        </div>
        <SheetFooter>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Edit settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile settings</SheetTitle>
          <SheetDescription>Update your display name and email address.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <InputField label="Display name" defaultValue="Maya Keller" />
          <InputField label="Email" defaultValue="maya@atlas.design" />
          <InputField label="Role" defaultValue="Design Lead" />
        </div>
        <SheetFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-4">
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Dashboard</a>
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Projects</a>
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Settings</a>
        </nav>
      </SheetContent>
    </Sheet>
}`,...B.parameters?.docs?.source}}},V=[`Default`,`WithForm`,`LeftSide`]}))();export{R as Default,B as LeftSide,z as WithForm,V as __namedExportsOrder,L as default};