"use strict";
exports.__esModule = true;
exports.Message = void 0;
var dynamic_1 = require("next/dynamic");
var date_fns_1 = require("date-fns");
var hint_1 = require("./hint");
var user_avatar_button_1 = require("./user-avatar-button");
var Renderer = dynamic_1["default"](function () { return Promise.resolve().then(function () { return require("@/components/renderer"); }); }, { ssr: false });
exports.Message = function (_a) {
    var id = _a.id, memberId = _a.memberId, authorImage = _a.authorImage, authorName = _a.authorName, isAuthor = _a.isAuthor, reactions = _a.reactions, body = _a.body, image = _a.image, createdAt = _a.createdAt, updatedAt = _a.updatedAt, isEditing = _a.isEditing, setEditingId = _a.setEditingId, isCompact = _a.isCompact, hideThreadButton = _a.hideThreadButton, threadCount = _a.threadCount, threadImage = _a.threadImage, threadTimestamp = _a.threadTimestamp;
    var EditSpan = function () {
        return updatedAt && (React.createElement("span", { className: "text-xs text-muted-foreground" }, "(edited)"));
    };
    var createDate = new Date(createdAt);
    if (isCompact)
        // compact message
        return (React.createElement("div", { className: "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative" },
            React.createElement("div", { className: "flex items-start gap-2" },
                React.createElement(hint_1.Hint, { label: formatFullTime(createDate) },
                    React.createElement("button", { className: "text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline" }, date_fns_1.format(createDate, "hh:mm"))),
                React.createElement("div", { className: "w-full flex flex-col" },
                    React.createElement(Renderer, { value: body }),
                    React.createElement(EditSpan, null)))));
    return (
    // normar message with user image and name
    React.createElement("div", { className: "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative" },
        React.createElement("div", { className: "flex items-start gap-2" },
            React.createElement(user_avatar_button_1.UserAvatarButton, { image: authorImage, name: authorName }),
            React.createElement("div", { className: "flex flex-col w-full overflow-hidden" },
                React.createElement("div", { className: "text-sm" },
                    React.createElement("button", { onClick: function () { }, className: "font-bold text-primary hover:underline" }, authorName),
                    React.createElement("span", null, "\u00A0\u00A0"),
                    React.createElement(hint_1.Hint, { label: formatFullTime(createDate) },
                        React.createElement("button", { className: "text-xs text-muted-foreground hover:underline" }, date_fns_1.format(createDate, "h:mm a")))),
                React.createElement(Renderer, { value: body }),
                React.createElement(EditSpan, null)))));
};
var formatFullTime = function (date) {
    return (date_fns_1.isToday(date) ? "Today" : date_fns_1.isYesterday(date) ? "Yesterday" : date_fns_1.format(date, "MMM d, yyyy")) + " at " + date_fns_1.format(date, "h:mm:ss");
};
