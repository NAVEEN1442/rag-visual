

export interface GetDocument {

    id: string,
    user_id: string,
    file_name: string,
    file_url: string,
    mime_type: string,
    status: string,
    created_at: string,
    status_code: Number

}

export interface PostDocument {

    id: string,
    user_id: string,
    file: File,
    status_code: number,

}