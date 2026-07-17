interface IOptions {
    page?:number,
    limit?:number,
    sortBy?:string,
    sortOrder?:string
}

interface IOptionsResult {
    page:number,
    limit:number,
    skip:number,
    sortBy:string,
    sortOrder:string
}

const calculatePagination = (options:IOptions):IOptionsResult => {
    const page:number = Number(options.page) || 1
    const limit:number = Number(options.limit) || 10

    const skip = (Number(page - 1) * limit);
    const sortBy  = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    return {skip,sortBy,page,limit,sortOrder}
}


export const paginationHelper = {
    calculatePagination
}