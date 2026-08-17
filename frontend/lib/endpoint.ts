import { api } from "./api-client"
import { GetDocument, PostDocument } from "./types"

export const DocumentAPI = {

    GetDocuments: (token: string | null) =>
        api.get<GetDocument[]>(token, "/get-documents"),

    UploadDocuments: (token: string | null, body: FormData) =>
        api.post<PostDocument>(token, "/document-upload", body)

}