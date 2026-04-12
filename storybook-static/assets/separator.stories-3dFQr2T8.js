import{n as e,o as t}from"./chunk-vNrZSFDR.js";import{t as n}from"./react-KkzZQhs-.js";import{t as r}from"./jsx-runtime-1mKRgjuZ.js";import{t as i}from"./react-dom-hrEDBiWN.js";import{n as a,r as o}from"./dist-C4tTqrc3.js";import{n as s,t as c}from"./utils-C_6qgufy.js";var l,u,d,f=e((()=>{l=t(n(),1),i(),o(),u=r(),d=[`a`,`button`,`div`,`form`,`h2`,`h3`,`img`,`input`,`label`,`li`,`nav`,`ol`,`p`,`select`,`span`,`svg`,`ul`].reduce((e,t)=>{let n=a(`Primitive.${t}`),r=l.forwardRef((e,r)=>{let{asChild:i,...a}=e,o=i?n:t;return typeof window<`u`&&(window[Symbol.for(`radix-ui`)]=!0),(0,u.jsx)(o,{...a,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{})}));function p(e){return v.includes(e)}var m,h,g,_,v,y,b,x=e((()=>{m=t(n(),1),f(),h=r(),g=`Separator`,_=`horizontal`,v=[`horizontal`,`vertical`],y=m.forwardRef((e,t)=>{let{decorative:n,orientation:r=_,...i}=e,a=p(r)?r:_,o=n?{role:`none`}:{"aria-orientation":a===`vertical`?a:void 0,role:`separator`};return(0,h.jsx)(d.div,{"data-orientation":a,...o,...i,ref:t})}),y.displayName=g,b=y})),S,C,w,T=e((()=>{S=r(),C=t(n()),x(),s(),w=C.forwardRef(({className:e,orientation:t=`horizontal`,decorative:n=!0,...r},i)=>(0,S.jsx)(b,{ref:i,decorative:n,orientation:t,className:c(`shrink-0 bg-border`,t===`horizontal`?`h-[1px] w-full`:`h-full w-[1px]`,e),...r})),w.displayName=b.displayName,w.__docgenInfo={description:``,methods:[],props:{orientation:{defaultValue:{value:`"horizontal"`,computed:!1},required:!1},decorative:{defaultValue:{value:`true`,computed:!1},required:!1}}}})),E,D,O,k,A,j;e((()=>{E=r(),T(),D={title:`Components/Separator`,tags:[`autodocs`]},O={render:()=>(0,E.jsxs)(`div`,{className:`flex flex-col gap-4 w-64`,children:[(0,E.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Above the separator`}),(0,E.jsx)(w,{}),(0,E.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Below the separator`})]})},k={render:()=>(0,E.jsxs)(`div`,{className:`flex items-center gap-4 h-8`,children:[(0,E.jsx)(`span`,{className:`text-sm`,children:`Item one`}),(0,E.jsx)(w,{orientation:`vertical`}),(0,E.jsx)(`span`,{className:`text-sm`,children:`Item two`}),(0,E.jsx)(w,{orientation:`vertical`}),(0,E.jsx)(`span`,{className:`text-sm`,children:`Item three`})]})},A={render:()=>(0,E.jsxs)(`nav`,{className:`flex flex-col gap-1 w-48`,children:[(0,E.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-1.5 rounded hover:bg-muted`,children:`Dashboard`}),(0,E.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-1.5 rounded hover:bg-muted`,children:`Projects`}),(0,E.jsx)(w,{className:`my-1`}),(0,E.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-1.5 rounded hover:bg-muted`,children:`Settings`}),(0,E.jsx)(`a`,{href:`#`,className:`text-sm px-2 py-1.5 rounded hover:bg-muted text-destructive`,children:`Sign out`})]})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 w-64">
      <p className="text-sm text-muted-foreground">Above the separator</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Below the separator</p>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4 h-8">
      <span className="text-sm">Item one</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item two</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item three</span>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <nav className="flex flex-col gap-1 w-48">
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Dashboard</a>
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Projects</a>
      <Separator className="my-1" />
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Settings</a>
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted text-destructive">Sign out</a>
    </nav>
}`,...A.parameters?.docs?.source}}},j=[`Horizontal`,`Vertical`,`InNav`]}))();export{O as Horizontal,A as InNav,k as Vertical,j as __namedExportsOrder,D as default};