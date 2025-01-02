export const consolidateResults = (result: any[], docs: any[], i: number) => {
    return {
        nodes: result[0].nodes.map((node: { id: any; type: any; properties: any }) => {
            return {
                id: node.id,
                type: node.type,
                properties: node.properties
            }
        }),
        relationships: result[0].relationships.map((relationship: { source: { id: any; type: any; properties: any; }; target: { id: any; type: any; properties: any; }; type: any; properties: any; }) => {
            return {
                source: {
                    id: relationship.source.id,
                    type: relationship.source.type,
                    properties: relationship.source.properties
                },
                target: {
                    id: relationship.target.id,
                    type: relationship.target.type,
                    properties: relationship.target.properties
                },
                type: relationship.type,
                properties: relationship.properties
            }
        }),
        source: {
            metadata: {
                pageNumber: docs[i].metadata.loc.pageNumber
            },
            pageContent: docs[i].pageContent,
        }
    }
}

export const docsToSource = (docs: any[], i: number) => {
    return {
        metadata: {
            pageNumber: docs[i].metadata.loc.pageNumber
        },
        pageContent: docs[i].pageContent,
    }
}