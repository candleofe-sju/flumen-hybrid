import { ReactAdapterElement, RenderHooks } from "Frontend/generated/flow/ReactAdapter";
import { ReactElement } from "react";
import { Button } from "@vaadin/react-components/Button.js";
import { VerticalLayout } from "@vaadin/react-components";

interface PersonData {
    name: string,
    age?: number
}

class PersonDataElement extends ReactAdapterElement {
    protected override render(hooks: RenderHooks): ReactElement | null {
        const fireUpdateEvent = hooks.useCustomEvent<PersonData>("update",
            // optional event detail:
            {detail: {name: "John", age: 42}}
        );
        return (
            <>
                <VerticalLayout>
                    <Button onClick={() => fireUpdateEvent({name: "Mike"})}>
                        Update
                    </Button>
                </VerticalLayout>
            </>
        );
    }
}
