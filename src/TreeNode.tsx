import React from 'react';
import './Treenode.scss';

type iTreeNode = {
    value: any,
    parent?: any,
    parentProperty?: number | symbol | string,
    parentComponent?: TreeNode,
}


export class TreeNode extends React.Component<iTreeNode, iTreeNode> {

    render() {
        const { value } = this.props;

        const MakeArrayTooltip = { tooltip: "Make Array" }
            , MakeObjectTooltip = { tooltip: "Make Object" }
            , addEntryTooltip = { tooltip: "Add new entry" }
            , deleteTooltip = { tooltip: "Delete" };

        if (typeof value === 'object') {
            const constructor = Object.getPrototypeOf(value).constructor;

            const isArray = constructor.name === 'Array';

            if (isArray) {
                return <div className="TreeNode Array">
                    <div className="NodeActions">
                        <span className="Action AddEntry" onClick={(event) => {
                            value.push('New Entry');
                            this.forceUpdate();
                        }} {...addEntryTooltip}>+</span>

                    </div>
                    <ul>
                        {Object.entries(value).map(([k, v]) =>
                            <li key={k}>
                                <span className="Action Delete" {...deleteTooltip}
                                    onClick={() => {
                                        this.props.parent[this.props.parentProperty!] = [...value.slice(0, +k), ...value.slice(+k + 1)];
                                        this.forceUpdate();
                                    }}>-</span>
                                <div className="property">
                                    <TreeNode value={v} key={k} parent={value} parentProperty={k} parentComponent={this} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
            else {
                return <div className="TreeNode Object">
                    <div className="NodeActions">
                        <span className="Action AddEntry" onClick={() => {
                            let newKey = 10;
                            while (newKey.toString(36) in value || /[0-9]/.test(newKey.toString(36))) {
                                newKey++;
                            }
                            value[newKey.toString(36)] = "New Entry";
                            this.forceUpdate();
                        }} {...addEntryTooltip}>+</span>
                    </div>
                    <ul>
                        {Object.entries(value).sort((a, b) => { return a[0] > b[0] ? 1 : -1 }).map(([k, v]) =>
                            <li key={k}>
                                <span className="Action Delete" {...deleteTooltip}
                                    onClick={() => {
                                        delete value[k];
                                        this.forceUpdate();
                                    }}>-</span>
                                <div className="property">
                                    <div className="key">
                                        <input defaultValue={k}
                                            className="NodeKey"
                                            onChange={(event) => {
                                                const newKey = (event.target as HTMLInputElement).value
                                                value[newKey] = value[k];
                                                delete value[k];
                                                k = newKey;
                                                this.forceUpdate();
                                            }}
                                            onBlur={(event) => this.forceUpdate()}
                                        />
                                    </div>
                                    <TreeNode value={v} key={k} parent={value} parentProperty={k} parentComponent={this} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
        }




        return <div className="NodeValWrapper">
            <div className="Actions">

                <span
                    className="Action MakeArray" {...MakeArrayTooltip}
                    onClick={() => {
                        this.props.parent[this.props.parentProperty!] = [];
                    }}
                >{`[]`}
                </span>

                <span
                    className="Action MakeObject"
                    {...MakeObjectTooltip}
                    onClick={() => {
                        this.props.parent[this.props.parentProperty!] = {};
                    }}>
                    {`{}`}
                </span>
            </div>
            <input
                onChange={(event: React.ChangeEvent) => {
                    const { parent, parentProperty } = this.props;
                    if (parent && parentProperty) {
                        parent[parentProperty] = (event.target as HTMLInputElement).value;
                    }
                }}
                defaultValue={value}
                style={{ width: ((`${this.props.parent[this.props.parentProperty!]}`.length / 2 + 0.5) + 'em') }}
                className="NodeVal" />
        </div>
    }
}