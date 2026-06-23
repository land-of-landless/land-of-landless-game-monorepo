import { BookOpen, Volume2 } from "lucide-react";
import { ArchivePage } from "../../../config/archiveData";
import { speakTextDirect } from "../../../lib/audio";

/**
 * Archives Modal Component
 * Paginated lore book reader for ancient chronicles
 */

interface ArchivesModalProps {
  /** Current archive page index */
  archivePage: number;
  /** All archive pages */
  archivePages: ArchivePage[];
  /** Callback to navigate to previous page */
  onPreviousPage: () => void;
  /** Callback to navigate to next page */
  onNextPage: () => void;
  /** Callback to close the modal */
  onClose: () => void;
}

export const ArchivesModal = ({
  archivePage,
  archivePages,
  onPreviousPage,
  onNextPage,
  onClose,
}: ArchivesModalProps) => {
  const currentPage = archivePages[archivePage];
  const isFirstPage = archivePage === 0;
  const isLastPage = archivePage === archivePages.length - 1;

  return (
    <div className="w-full max-w-xl bg-[#faf6ee] border-2 border-amber-900/40 rounded-xl shadow-2xl p-6 text-stone-900 min-h-[380px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
          <h3 className="font-serif font-black tracking-widest text-[#3e2723] text-sm flex items-center gap-2">
            <BookOpen size={18} />
            CHRONICLES OF LANDLESS
          </h3>
          <span className="font-serif text-[10px] text-amber-800 uppercase italic">
            Lore Book: Vol. {archivePage + 1}
          </span>
        </div>

        <div className="my-5 space-y-3 font-serif">
          <h4 className="text-base font-bold text-[#5d4037] border-b border-stone-300 pb-1.5">
            {currentPage.title}
          </h4>
          <p className="text-xs leading-relaxed text-stone-800 text-justify indent-6">
            {currentPage.content}
          </p>
        </div>
      </div>

      <div className="border-t border-amber-900/20 pt-4 flex justify-between items-center">
        <button
          onClick={() => speakTextDirect(currentPage.content)}
          className="bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300 px-3 py-1.5 rounded text-[11px] transition flex items-center gap-1 font-sans cursor-pointer font-bold"
          title="Hear active page text"
        >
          <Volume2 size={13} />
          Hear Lore Page
        </button>

        <div className="flex gap-2 font-sans text-xs">
          <button
            onClick={onPreviousPage}
            disabled={isFirstPage}
            className={`px-3 py-1.5 rounded border transition cursor-pointer ${
              isFirstPage
                ? "text-stone-300 border-stone-200 bg-stone-50 cursor-not-allowed"
                : "text-stone-800 border-stone-300 bg-stone-200 hover:bg-stone-300"
            }`}
          >
            Back Page
          </button>
          <button
            onClick={onNextPage}
            disabled={isLastPage}
            className={`px-3 py-1.5 rounded border transition cursor-pointer ${
              isLastPage
                ? "text-stone-300 border-stone-200 bg-stone-50 cursor-not-allowed"
                : "text-stone-800 border-stone-300 bg-stone-200 hover:bg-stone-300"
            }`}
          >
            Next Page
          </button>
          <button
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold px-3 py-1.5 rounded transition cursor-pointer"
          >
            Close Archives
          </button>
        </div>
      </div>
    </div>
  );
};
