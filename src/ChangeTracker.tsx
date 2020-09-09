import React from 'react';
import './Treenode.scss';

type iTreeNode = {
    value: any,
    parent?: any,
    parentProperty?: number | symbol | string,
    parentComponent?: ChangeTracker,
}


export class ChangeTracker extends React.Component<iTreeNode, iTreeNode> {

    render() {
        const { value } = this.props;

        if (typeof value === 'object') {
            const constructor = Object.getPrototypeOf(value).constructor;

            const isArray = constructor.name === 'Array';

            if (isArray) {
                return <div className="TreeNode Array">
                    <ul>
                        {Object.entries(value).map(([k, v]) =>
                            <li key={k}>
                                <div className="property">
                                    <ChangeTracker value={v} key={k} parent={value} parentProperty={k} parentComponent={this} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
            else {
                return <div className="TreeNode Object">
                    <ul>
                        {Object.entries(value).sort((a, b) => { return a[0] > b[0] ? 1 : -1 }).map(([k, v]) =>
                            <li key={k}>
                                <div className="property">
                                    <div className="key">
                                        <span
                                            className="NodeKey"
                                        >{k}</span>
                                    </div>
                                    <ChangeTracker value={v} key={k} parent={value} parentProperty={k} parentComponent={this} />
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            }
        }




        return <div className="NodeValWrapper">
            <span className="NodeVal" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</span>
        </div>
    }
}