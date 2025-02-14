import PropTypes from "prop-types";
import {
  FiBookOpen,
  FiCalendar,
  FiAlertTriangle,
  FiSearch,
  FiVolume2,
  FiCpu,
} from "react-icons/fi";
import styles from "./Announcements.module.css";

// نگاشت آیکون‌ها براساس مقدار رشته‌ای موجود در فیلد icon مدل
const iconMapping = {
  book: <FiBookOpen size={20} />,
  calendar: <FiCalendar size={20} />,
  alert: <FiAlertTriangle size={20} />,
  research: <FiSearch size={20} />,
  megaphone: <FiVolume2 size={20} />,
  system: <FiCpu size={20} />,
};

const CategoryBadge = ({ category }) => {
  // destructuring اطلاعات مورد نیاز از آبجکت category
  const { name, colorCode, icon } = category;

  // استفاده از رنگ تعیین‌شده در مدل یا پیش‌فرض در صورت عدم موجودیت
  const badgeColor = colorCode || "var(--teal)";

  // انتخاب آیکون براساس نگاشت؛ در صورت عدم تطابق، آیکون پیش‌فرض system انتخاب می‌شود
  const IconComponent = iconMapping[icon] || iconMapping["system"];

  return (
    <div
      className={styles.categoryBadge}
      style={{ backgroundColor: badgeColor }}
      data-aos="fade-left"
      data-aos-delay="300"
    >
      {IconComponent}
      <span className={styles.badgeText}>{name}</span>
    </div>
  );
};

CategoryBadge.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    colorCode: PropTypes.string,
    icon: PropTypes.oneOf([
      "book",
      "calendar",
      "alert",
      "research",
      "megaphone",
      "system",
    ]).isRequired,
    priority: PropTypes.number,
  }).isRequired,
};

export default CategoryBadge;
