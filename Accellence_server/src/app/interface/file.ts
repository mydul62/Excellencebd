export interface ICloudinaryResponse {
    asset_id:string
    public_id:string
    version:number
    version_id:string
    signature:string
    width:number
    height:number
    format:string
    resourse_type:string
    created_at:Date
    tags:string[]
    bytes:number
    type:string
    etag:string
    placeholder:boolean
    url:string
    secure_url:string
    folder:string
    overwritten:boolean
    orginal_filename:string
    orginal_extension:string
    api_key:string
}


export interface IFile {
    // fileName:string
    orginalname:string
    encoding:string
    mimetype:string
    destination:string
    filename:string
    path:string
    size:number
}