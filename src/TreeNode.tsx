import React from 'react';
import './treenode.scss';

type iTreeNodeProps = {
    value: any
}

type iTreeNodeState = {
    value: any
}

export class TreeNode extends React.Component<iTreeNodeProps, iTreeNodeProps> {
    constructor(props: iTreeNodeProps) {
        super(props);
        this.state = {
            value: props.value
        }
    }

    render() {
        const value: any = this.state.value;

        if (typeof value === 'object') {
            const constructor = Object.getPrototypeOf(value).constructor;

            const isArray = constructor.name === 'Array';

            if (isArray) {
                return <div className="TreeNode Array">
                    <ul>
                        {Object.entries(value).map(([k, v]) =>
                            <li key={k}>
                                <div className="property">
                                    <TreeNode value={v} key={k} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
            else {
                return <div className="TreeNode Object">
                    <ul>
                        {Object.entries(value).map(([k, v]) =>
                            <li key={k}>
                                <div className="property">
                                    <div className="key">{k}</div>
                                    <TreeNode value={v} key={k} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
        }


        return <div className="NodeVal">{`${value}`}</div>
    }
}