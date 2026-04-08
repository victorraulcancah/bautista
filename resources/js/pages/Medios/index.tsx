import { Head } from '@inertiajs/react';
import { Folder, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ResourcePage from '@/components/shared/ResourcePage';
import Breadcrumb from './components/Breadcrumb';
import NewFolderModal from './components/NewFolderModal';
import EditFolderModal from './components/EditFolderModal';
import MediosGrid from './components/MediosGrid';
import { useMedios } from './hooks/useMedios';
import { useFileUpload } from './hooks/useFileUpload';
import { useFolderActions } from './hooks/useFolderActions';
import { useDeleteActions } from './hooks/useDeleteActions';
import { useEditFolder } from './hooks/useEditFolder';
import { handleDownload } from './utils/fileHelpers';
import type { BreadcrumbItem } from '@/types';
import type { Medio } from './hooks/useMedios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Biblioteca', href: '/biblioteca' },
];

export default function MediosIndex() {
    const {
        medios,
        loading,
        search,
        setSearch,
        currentFolder,
        breadcrumbPath,
        navigateToFolder,
        reloadMedios,
    } = useMedios();

    const {
        uploading,
        fileInputRef,
        handleUploadClick,
        handleUpload,
    } = useFileUpload(currentFolder, reloadMedios);

    const {
        showNewFolderModal,
        setShowNewFolderModal,
        newFolderName,
        setNewFolderName,
        creatingFolder,
        handleCreateFolder,
    } = useFolderActions(currentFolder, reloadMedios);

    const {
        showDeleteModal,
        setShowDeleteModal,
        itemToDelete,
        setItemToDelete,
        deleting,
        handleDelete,
        confirmDelete,
    } = useDeleteActions(reloadMedios);

    const {
        showEditModal,
        setShowEditModal,
        folderToEdit,
        setFolderToEdit,
        editFolderName,
        setEditFolderName,
        updating,
        handleEditFolder,
        handleUpdateFolder,
    } = useEditFolder(reloadMedios);

    const handleItemClick = (medio: Medio) => {
        if (medio.es_carpeta) {
            navigateToFolder(medio.id_medio);
        } else {
            handleDownload(medio.ruta, medio.nombre);
        }
    };

    const handleDownloadClick = (medio: Medio) => {
        handleDownload(medio.ruta, medio.nombre);
    };

    return (
        <>
            <Head title="Biblioteca de Medios" />
            
            {/* Input oculto para subir archivos */}
            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleUpload}
                disabled={uploading}
            />

            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Biblioteca de Medios"
                subtitle={`${medios.length} elementos`}
                icon={Folder}
                iconColor="bg-indigo-600"
                search={search}
                onSearch={setSearch}
                extraButtons={
                    <Button
                        onClick={() => setShowNewFolderModal(true)}
                        variant="outline"
                        className="border-neutral-200 hover:bg-neutral-50 gap-2 font-bold text-sm flex-1 sm:flex-none"
                    >
                        <FolderPlus className="h-4 w-4" />
                        Nueva Carpeta
                    </Button>
                }
                btnLabel={uploading ? 'Subiendo...' : 'Subir Archivo'}
                onNew={handleUploadClick}
            >
                {/* Breadcrumb de navegación */}
                <Breadcrumb 
                    breadcrumbPath={breadcrumbPath}
                    onNavigate={navigateToFolder}
                />

                {/* Grid de archivos y carpetas */}
                <MediosGrid
                    medios={medios}
                    loading={loading}
                    search={search}
                    onItemClick={handleItemClick}
                    onDownload={handleDownloadClick}
                    onEdit={handleEditFolder}
                    onDelete={handleDelete}
                />
            </ResourcePage>

            {/* Modal para crear nueva carpeta */}
            <NewFolderModal
                open={showNewFolderModal}
                onClose={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                }}
                folderName={newFolderName}
                onFolderNameChange={setNewFolderName}
                onConfirm={handleCreateFolder}
                processing={creatingFolder}
            />

            {/* Modal para editar carpeta */}
            <EditFolderModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setFolderToEdit(null);
                    setEditFolderName('');
                }}
                folderName={editFolderName}
                onFolderNameChange={setEditFolderName}
                onConfirm={handleUpdateFolder}
                processing={updating}
            />

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
                processing={deleting}
                title={itemToDelete?.esCarpeta ? 'Eliminar carpeta' : 'Eliminar archivo'}
                message={
                    itemToDelete?.esCarpeta
                        ? '¿Estás seguro de que deseas eliminar esta carpeta y todo su contenido? Esta acción no se puede deshacer.'
                        : '¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.'
                }
            />
        </>
    );
}
