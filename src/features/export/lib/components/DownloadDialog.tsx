import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import wechatPng from "@asset/wechat.png";
import taobao1 from "@asset/taobao1.jpg";
import taobao2 from "@asset/taobao2.jpg";

const TaobaoImg: React.FC = () => {
  return (
    <div className="flex h-full w-full justify-center overflow-hidden rounded-lg">
      <img src={taobao1} alt="淘宝店铺" className="h-full object-contain" />
      <img src={taobao2} alt="淘宝店铺" className="h-full object-contain" />
    </div>
  );
};

interface DownloadDialogProps {
  /** 控制弹窗显示/隐藏 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 立即下载按钮点击回调 */
  onDownload: () => void;
  /** 额外的类名 */
  className?: string;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  onDownload,
  className,
}) => {
  // 点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        className
      )}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        className="relative w-full max-w-[700px] rounded-2xl bg-white py-6 px-20 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="下载弹窗"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="关闭弹窗"
        >
          <X size={20} />
        </button>

        {/* 上半部分：立即下载按钮 */}
        <div className="pt-4">
          <button
            onClick={onDownload}
            className="w-full rounded-xl bg-black py-3 text-base font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            立即下载
          </button>
        </div>

        {/* 中间虚线分隔 */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-gray-300"></div>
          </div>
        </div>

        {/* 下半部分：提示文字和二维码 */}
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            想要纸质成品？有新想法？随时找我们
          </p>

          {/* 两个二维码 */}
          <div className="flex justify-center gap-6">
            {/* 微信二维码 */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-24 w-24 overflow-hidden bg-gray-100">
                <img
                  src={wechatPng}
                  alt="微信二维码"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-500">微信</span>
            </div>

            {/* 淘宝店铺二维码 */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-24 overflow-hidden rounded-lg bg-gray-100">
                <TaobaoImg />
              </div>
              <span className="text-xs text-gray-500">淘宝店铺</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadDialog;
