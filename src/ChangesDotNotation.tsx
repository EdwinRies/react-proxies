import React from 'react';

export function ChangesDotNotation(props: any) {

    return <>{generateDotNotation(props.value).map(v =>
        <p key={v.key}>{v.key + ': ' + v.val}</p>
    )}</>

}


function generateDotNotation(o: any, path = ""): iKeyVal[] {
    let res: iKeyVal[] = [];
    Object.entries(o).forEach(kv => {
        if (typeof kv[1] === 'object') {
            res.push(...generateDotNotation(kv[1], path + kv[0] + "."));
        }
        else {
            res.push({ key: path + `${kv[0]}`, val: `${kv[1]}` })
        }
    })

    return res;
}

interface iKeyVal {
    val: string;
    key: string;
}