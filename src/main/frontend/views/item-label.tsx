import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { AutoCrud } from '@vaadin/hilla-react-crud';
import { useSignal } from '@vaadin/hilla-react-signals';
import { GridColumn, MultiSelectComboBox, TextField } from '@vaadin/react-components';
import Item from 'Frontend/generated/com/eugentia/app/data/entity/Item';
import ItemModel from 'Frontend/generated/com/eugentia/app/data/entity/ItemModel';
import Label from 'Frontend/generated/com/eugentia/app/data/entity/Label';
import Matcher from 'Frontend/generated/com/vaadin/hilla/crud/filter/PropertyStringFilter/Matcher';
import { ItemService, LabelService } from 'Frontend/generated/endpoints';
import { useEffect } from 'react';

export const config: ViewConfig = {
    menu: {order: 17, icon: 'line-awesome/svg/globe-solid.svg'},
    title: 'Item Labels',
    rolesAllowed: ['USER'],
};

export default function ItemsView() {
    const labels = useSignal<Label[]>([]);

    useEffect(() => {
        LabelService.getLabels().then((value) => (labels.value = value))
    }, [])

    return (
        <AutoCrud
            model={ItemModel}
            service={ItemService}
            gridProps={{
                visibleColumns: ['name', 'labels'],
                customColumns: [
                    <GridColumn
                        key="labels"
                        header="Labels"
                        autoWidth
                        renderer={({item}: { item: Item }) => {
                            const {labels} = item;
                            return <span>{labels?.map((l) => l?.value).join(", ")}</span>;
                        }}
                    />,
                ],
                columnOptions: {
                    labels: {
                        headerFilterRenderer: ({setFilter}) => (
                            <TextField
                                theme='small'
                                placeholder='Filter...'
                                onValueChanged={({detail: {value}}) =>
                                    setFilter({
                                        propertyId: "labels.value",
                                        filterValue: value,
                                        matcher: Matcher.CONTAINS,
                                        "@type": "propertyString",
                                    })
                                }
                            />
                        ),
                    },
                }
            }}
            formProps={{
                visibleFields: ['name', 'labels'],
                fieldOptions: {
                    labels: {
                        renderer: ({field}) => <MultiSelectComboBox {...field} items={labels.value} itemIdPath="id"
                                                                    itemValuePath="value" itemLabelPath="value"/>,
                    }
                }
            }}
        />
    );
}
