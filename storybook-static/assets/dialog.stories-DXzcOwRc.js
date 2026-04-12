import{n as e,o as t}from"./chunk-vNrZSFDR.js";import{t as n}from"./react-KkzZQhs-.js";import{t as r}from"./jsx-runtime-1mKRgjuZ.js";import{n as i,t as a}from"./utils-C_6qgufy.js";import{n as o,t as s}from"./button-CYvc_U_-.js";import{n as c,t as l}from"./input-field-D_aw24k5.js";import{n as u,t as d}from"./lucide-react-CC6EpCzj.js";import{a as f,c as p,i as m,l as h,n as g,o as _,r as v,s as y,t as b}from"./dist-CmMM1QLY.js";var x,S,C,w,T,E,D,O,k,A,j,M=e((()=>{x=r(),S=t(n()),h(),d(),i(),C=_,w=p,T=f,E=S.forwardRef(({className:e,...t},n)=>(0,x.jsx)(m,{ref:n,className:a(`fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`,e),...t})),E.displayName=m.displayName,D=S.forwardRef(({className:e,children:t,...n},r)=>(0,x.jsxs)(T,{children:[(0,x.jsx)(E,{}),(0,x.jsxs)(g,{ref:r,className:a(`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg`,e),...n,children:[t,(0,x.jsxs)(b,{className:`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground`,children:[(0,x.jsx)(u,{className:`h-4 w-4`}),(0,x.jsx)(`span`,{className:`sr-only`,children:`Close`})]})]})]})),D.displayName=g.displayName,O=({className:e,...t})=>(0,x.jsx)(`div`,{className:a(`flex flex-col space-y-1.5 text-center sm:text-left`,e),...t}),O.displayName=`DialogHeader`,k=({className:e,...t})=>(0,x.jsx)(`div`,{className:a(`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`,e),...t}),k.displayName=`DialogFooter`,A=S.forwardRef(({className:e,...t},n)=>(0,x.jsx)(y,{ref:n,className:a(`text-lg font-semibold leading-none tracking-tight`,e),...t})),A.displayName=y.displayName,j=S.forwardRef(({className:e,...t},n)=>(0,x.jsx)(v,{ref:n,className:a(`text-sm text-muted-foreground`,e),...t})),j.displayName=v.displayName,E.__docgenInfo={description:``,methods:[]},D.__docgenInfo={description:``,methods:[]},O.__docgenInfo={description:``,methods:[],displayName:`DialogHeader`},k.__docgenInfo={description:``,methods:[],displayName:`DialogFooter`},A.__docgenInfo={description:``,methods:[]},j.__docgenInfo={description:``,methods:[]}})),N,P,F,I,L,R;e((()=>{N=r(),o(),c(),M(),P={title:`Components/Dialog`,tags:[`autodocs`]},F={render:()=>(0,N.jsxs)(C,{children:[(0,N.jsx)(w,{asChild:!0,children:(0,N.jsx)(s,{children:`Open dialog`})}),(0,N.jsxs)(D,{children:[(0,N.jsxs)(O,{children:[(0,N.jsx)(A,{children:`Confirm action`}),(0,N.jsx)(j,{children:`This action cannot be undone. Are you sure you want to continue?`})]}),(0,N.jsxs)(k,{children:[(0,N.jsx)(s,{variant:`ghost`,children:`Cancel`}),(0,N.jsx)(s,{children:`Continue`})]})]})]})},I={render:()=>(0,N.jsxs)(C,{children:[(0,N.jsx)(w,{asChild:!0,children:(0,N.jsx)(s,{variant:`secondary`,children:`Edit profile`})}),(0,N.jsxs)(D,{children:[(0,N.jsxs)(O,{children:[(0,N.jsx)(A,{children:`Edit profile`}),(0,N.jsx)(j,{children:`Make changes to your profile here. Click save when you're done.`})]}),(0,N.jsxs)(`div`,{className:`flex flex-col gap-4 py-2`,children:[(0,N.jsx)(l,{label:`Name`,defaultValue:`Maya Keller`}),(0,N.jsx)(l,{label:`Email`,defaultValue:`maya@atlas.design`})]}),(0,N.jsxs)(k,{children:[(0,N.jsx)(s,{variant:`ghost`,children:`Cancel`}),(0,N.jsx)(s,{children:`Save changes`})]})]})]})},L={render:()=>(0,N.jsxs)(C,{children:[(0,N.jsx)(w,{asChild:!0,children:(0,N.jsx)(s,{variant:`destructive`,children:`Delete prototype`})}),(0,N.jsxs)(D,{children:[(0,N.jsxs)(O,{children:[(0,N.jsx)(A,{children:`Delete prototype`}),(0,N.jsx)(j,{children:`This will permanently delete the prototype and all its files. This action cannot be undone.`})]}),(0,N.jsxs)(k,{children:[(0,N.jsx)(s,{variant:`ghost`,children:`Cancel`}),(0,N.jsx)(s,{variant:`destructive`,children:`Delete`})]})]})]})},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <InputField label="Name" defaultValue="Maya Keller" />
          <InputField label="Email" defaultValue="maya@atlas.design" />
        </div>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete prototype</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete prototype</DialogTitle>
          <DialogDescription>
            This will permanently delete the prototype and all its files. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...L.parameters?.docs?.source}}},R=[`Default`,`WithForm`,`Destructive`]}))();export{F as Default,L as Destructive,I as WithForm,R as __namedExportsOrder,P as default};