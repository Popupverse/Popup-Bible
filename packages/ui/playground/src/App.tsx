import Acts from "@popup-bible/flat-converter/bsb/Acts";

import { App } from "../../src/components/app/App.tsx";
import { Router } from "../../src/components/app/router/Router.tsx";

export function Playground() {
  return (
    <App container={document.body}>
      <Router fetchBook={() => Promise.resolve(Acts)} initialEntries={["/book/Acts?chapter=1"]} />
    </App>
  );
}
