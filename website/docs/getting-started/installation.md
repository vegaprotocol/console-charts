---
sidebar_position: 2
---

import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# Installation

## Adding Pennant

React and React DOM are required peer dependencies. You must add them to your project if they are not already installed:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm install react react-dom leaflet
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add react react-dom leaflet
```

</TabItem>
</Tabs>

Then you can install Pennant:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm install pennant
```

</TabItem>
<TabItem value="yarn">

```bash
yarn add pennant
```

</TabItem>
</Tabs>

Finally, you can import the necessary components. For example:

```js
import { Chart } from "pennant";
```
