import{n as e,o as t}from"./chunk-vNrZSFDR.js";import{t as n}from"./react-KkzZQhs-.js";import{t as r}from"./jsx-runtime-1mKRgjuZ.js";import{n as i,t as a}from"./utils-C_6qgufy.js";import{n as o,t as s}from"./button-CYvc_U_-.js";var c,l,u,d,f,p,m,h,g=e((()=>{c=r(),l=t(n()),i(),u=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`rounded-lg border border-border bg-card text-card-foreground shadow-sm`,e),...t})),u.displayName=`Card`,d=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`flex flex-col space-y-1.5 p-6`,e),...t})),d.displayName=`CardHeader`,f=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`text-2xl font-semibold leading-none tracking-tight`,e),...t})),f.displayName=`CardTitle`,p=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`text-sm text-muted-foreground`,e),...t})),p.displayName=`CardDescription`,m=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`p-6 pt-0`,e),...t})),m.displayName=`CardContent`,h=l.forwardRef(({className:e,...t},n)=>(0,c.jsx)(`div`,{ref:n,className:a(`flex items-center p-6 pt-0`,e),...t})),h.displayName=`CardFooter`,u.__docgenInfo={description:``,methods:[],displayName:`Card`},d.__docgenInfo={description:``,methods:[],displayName:`CardHeader`},h.__docgenInfo={description:``,methods:[],displayName:`CardFooter`},f.__docgenInfo={description:``,methods:[],displayName:`CardTitle`},p.__docgenInfo={description:``,methods:[],displayName:`CardDescription`},m.__docgenInfo={description:``,methods:[],displayName:`CardContent`}})),_,v,y,b,x,S,C;e((()=>{_=r(),g(),o(),v={title:`Components/Card`,tags:[`autodocs`]},y={render:()=>(0,_.jsx)(u,{children:(0,_.jsx)(m,{children:`This is the card body. It can contain any content.`})})},b={render:()=>(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:(0,_.jsx)(`h3`,{className:`text-base font-semibold text-foreground`,children:`Card Title`})}),(0,_.jsx)(m,{children:`This card has a header and body.`})]})},x={render:()=>(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:(0,_.jsx)(`h3`,{className:`text-base font-semibold text-foreground`,children:`Card Title`})}),(0,_.jsx)(m,{children:(0,_.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`This card has a header, body content, and a footer with actions.`})}),(0,_.jsxs)(h,{className:`justify-end gap-2`,children:[(0,_.jsx)(s,{variant:`ghost`,size:`sm`,children:`Cancel`}),(0,_.jsx)(s,{size:`sm`,children:`Confirm`})]})]})},S={render:()=>(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:(0,_.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,_.jsx)(`h3`,{className:`text-base font-semibold text-foreground`,children:`Account Settings`}),(0,_.jsx)(`span`,{className:`rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700`,children:`Active`})]})}),(0,_.jsx)(m,{children:(0,_.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Manage your account preferences and connected services.`})}),(0,_.jsxs)(h,{className:`justify-between`,children:[(0,_.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Last updated 2 hours ago`}),(0,_.jsx)(s,{size:`sm`,children:`Save changes`})]})]})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardContent>This is the card body. It can contain any content.</CardContent>
    </Card>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-foreground">Card Title</h3>
      </CardHeader>
      <CardContent>This card has a header and body.</CardContent>
    </Card>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-foreground">Card Title</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This card has a header, body content, and a footer with actions.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Account Settings</h3>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and connected services.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">Last updated 2 hours ago</span>
        <Button size="sm">Save changes</Button>
      </CardFooter>
    </Card>
}`,...S.parameters?.docs?.source}}},C=[`BodyOnly`,`WithHeader`,`WithHeaderAndFooter`,`FullFeatured`]}))();export{y as BodyOnly,S as FullFeatured,b as WithHeader,x as WithHeaderAndFooter,C as __namedExportsOrder,v as default};