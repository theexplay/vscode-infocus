export interface Project {
    id: number
    order: number
    color: number
    name: string
    comment_count: number
};

export interface Task {
    id: number;
    project_id: number;
    section_id: number;
    order: number;
    content: string;
    description?: string;
    parent_id?: number;
    completed: boolean;
    label_ids: number[];
    priority: number;
    create: string;
    url: string;
    added_by_uid: number;
    assigned_by_uid: null | string;
    checked: number;
    child_order: number;
    collapsed: number;
    date_added: string;
    date_completed: null | string;
    day_order: number;
    due: null | string;
    has_more_notes: boolean;
    in_history: number;
    is_deleted: number;
    labels: number[];
};

export interface Note {
    id: number;
    legacy_id: number;
    posted_uid: number;
    item_id: number;
    legacy_item_id: number;
    project_id: number;
    legacy_project_id: number;
    content: string;
    file_attachment: FileAttachment;
    uids_to_notify: number[];
    is_deleted: number;
    posted: string;
    reactions: Record<string, number[]>;
};

export interface FileAttachment {
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    upload_state: string;
}

export interface Section {
    id: number;
    name: string;
    project_id: number;
    legacy_project_id?: number;
    section_order: number;
    collapsed: boolean;
    sync_id: number | null;
    is_deleted: boolean;
    is_archived: boolean;
    date_archived: string | null;
    date_added: string;
}
